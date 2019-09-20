import { LcLog } from "./Tools";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    EPSILON = 0.1;
    POINT_SQR_EPSILON = 5;
    ctx:cc.Graphics;
    touching:boolean;
    r1:Array<cc.PhysicsRayCastResult>;
    r2:Array<cc.PhysicsRayCastResult>;
    results:Array<cc.PhysicsRayCastResult>;
    touchStartPoint:cc.Vec2; // 触摸的起点
    touchPoint:cc.Vec2;// 当前的触摸点
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var canvas = cc.find('Canvas');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        canvas.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.ctx = this.getComponent(cc.Graphics);
    }

    start () {

    }

    update (dt) {
        this.recalcResults();
    }

    onTouchStart (event:cc.Event.EventTouch) {
        LcLog("onTouchStart");
        this.touching = true;
        this.r1 = this.r2 = this.results = null;
        this.touchStartPoint = this.touchPoint = cc.v2( event.touch.getLocation() );
    }
    onTouchMove (event:cc.Event.EventTouch) {
        LcLog("onTouchMove");
        this.touchPoint = cc.v2( event.touch.getLocation() );
    }
    onTouchEnd (event:cc.Event.EventTouch) {
        LcLog("onTouchEnd");
        this.touchPoint = cc.v2( event.touch.getLocation() );
        this.recalcResults();
        this.touching = false;

        let point = cc.v2( event.touch.getLocation() );
        if ( this.equals(this.touchStartPoint.sub(point).magSqr(), 0) ) return;

        // recalculate fraction, make fraction from one direction
        this.r2.forEach(r => {
            r.fraction = 1 - r.fraction;
        });

        let results = this.results;
        let pairs = new Array<Array<cc.PhysicsRayCastResult>>();

        for (let i = 0; i < results.length; i++) {
            let find = false;
            let result = results[i];

            for (let j = 0; j < pairs.length; j++) {
                let pair = pairs[j];
                if (pair[0] && result.collider === pair[0].collider) {
                    find = true;
                    // one collider may contains several fixtures, so raycast may through the inner fixture side
                    // we need remove them from the result
                    let r = null;
                    for(let k =0 ;k<pair.length;k++){
                        let raycastResult = pair[k];
                        if(raycastResult.point.sub(result.point).magSqr() <= this.POINT_SQR_EPSILON){
                            r= raycastResult;
                            break;
                        }
                    }

                    if (r) {
                        pair.splice(pair.indexOf(r), 1);
                    }
                    else { 
                        pair.push(result);
                    }

                    break;
                }
            }

            if (!find) {
                pairs.push([result]);
            }
        }

        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            if (pair.length < 2) {
                continue;
            }

            // sort pair with fraction
            pair = pair.sort(this.compare);

            let splitResults = [];

            // first calculate all results, not split collider right now
            for (let j = 0; j < (pair.length - 1); j +=2) {
                let r1 = pair[j];
                let r2 = pair[j+1];

                if (r1 && r2) {
                    this.split(r1.collider, r1.point, r2.point, splitResults);
                }
            }

            if (splitResults.length <= 0) {
                continue;
            }

            let collider = pair[0].collider;

            let maxPointsResult;
            for (let j = 0; j < splitResults.length; j++) {
                let splitResult = splitResults[j];

                for (let k = 0; k < splitResult.length; k++) {
                    if (typeof splitResult[k] === 'number') {
                        splitResult[k] = (collider as unknown as cc.PolygonCollider).points[splitResult[k]];
                    }
                }

                if (!maxPointsResult || splitResult.length > maxPointsResult.length) {
                    maxPointsResult = splitResult;
                }
            }

            if (maxPointsResult.length < 3) {
                continue;
            }

            // keep max length points to origin collider
            (collider as unknown as cc.PolygonCollider).points = maxPointsResult;
            collider.apply();

            let body = collider.body;

            for (let j = 0; j < splitResults.length; j++) {
                let splitResult = splitResults[j];

                if (splitResult.length < 3) continue;
                if (splitResult == maxPointsResult) continue;

                // create new body
                let node = new cc.Node();
                node.position = body.getWorldPosition(new cc.Vec2());
                node.rotation = body.getWorldRotation();
                node.parent = cc.director.getScene();
                
                node.addComponent(cc.RigidBody);
                
                let newCollider = node.addComponent(cc.PhysicsPolygonCollider);
                newCollider.points = splitResult;
                newCollider.apply();
            }
            
        }

    }
    recalcResults () {
        if (!this.touching) return;
        let point = this.touchPoint;
        this.ctx.clear();
        this.ctx.moveTo(this.touchStartPoint.x, this.touchStartPoint.y);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();

        let manager = cc.director.getPhysicsManager();
        // manager.rayCast() method calls this function only when it sees that a given line gets into the body - it doesnt see when the line gets out of it.
        // I must have 2 intersection points with a body so that it can be sliced, thats why I use manager.rayCast() again, but this time from B to A - that way the point, at which BA enters the body is the point at which AB leaves it!
        let r1 = manager.rayCast(this.touchStartPoint, point, cc.RayCastType.All);
        let r2 = manager.rayCast(point, this.touchStartPoint, cc.RayCastType.All);

        let results = r1.concat(r2);

        for (let i = 0; i < results.length; i++) {
            let p = results[i].point;
            this.ctx.circle(p.x, p.y, 5);
        }  
        this.ctx.fill();

        this.r1 = r1;
        this.r2 = r2;
        this.results = results;
    }
    split (collider, p1, p2, splitResults) {
        let body = collider.body;
        let points = (collider as unknown as cc.PolygonCollider).points;


        // The manager.rayCast() method returns points in world coordinates, so use the body.getLocalPoint() to convert them to local coordinates.
        p1 = body.getLocalPoint(p1);
        p2 = body.getLocalPoint(p2);


        let newSplitResult1 = [p1, p2];
        let newSplitResult2 = [p2, p1];

        let index1, index2;
        for (let i = 0; i < points.length; i++) {
            let pp1 = points[i];
            let pp2 = i === points.length - 1 ? points[0] : points[i+1];
          
            if (index1 === undefined && this.pointInLine(p1, pp1, pp2)) {
                index1 = i;
            }
            else if (index2 === undefined && this.pointInLine(p2, pp1, pp2)) {
                index2 = i;
            }

            if (index1 !== undefined && index2 !== undefined) {
                break;
            }
        }

        // console.log(index1 + ' : ' + index2);

        if (index1 === undefined || index2 === undefined) {
            return;
        }

        let splitResult, indiceIndex1 = index1, indiceIndex2 = index2;
        if (splitResults.length > 0) {
            for (let i = 0; i < splitResults.length; i++) {
                let indices = splitResults[i];
                indiceIndex1 = indices.indexOf(index1);
                indiceIndex2 = indices.indexOf(index2);

                if (indiceIndex1 !== -1 && indiceIndex2 !== -1) {
                    splitResult = splitResults.splice(i, 1)[0];
                    break;
                }
            }
        }

        if (!splitResult) {
            splitResult = points.map((p, i) => {
                return i;
            });
        }

        for (let i = indiceIndex1 + 1; i !== (indiceIndex2+1); i++) {
            if (i >= splitResult.length) {
                i = 0;
            }

            let p = splitResult[i];
            p = typeof p === 'number' ? points[p] : p;
            
            if (p.sub(p1).magSqr() < this.POINT_SQR_EPSILON || p.sub(p2).magSqr() < this.POINT_SQR_EPSILON) {
                continue;
            }

            newSplitResult2.push(splitResult[i]);
        }

        for (let i = indiceIndex2 + 1; i !== indiceIndex1+1; i++) {
            if (i >= splitResult.length) {
                i = 0;
            }

            let p = splitResult[i];
            p = typeof p === 'number' ? points[p] : p;
            
            if (p.sub(p1).magSqr() < this.POINT_SQR_EPSILON || p.sub(p2).magSqr() < this.POINT_SQR_EPSILON) {
                continue;
            }

            newSplitResult1.push(splitResult[i]);
        }

        splitResults.push(newSplitResult1);
        splitResults.push(newSplitResult2);
    }
    equalsVec2(a,b) {
        return this.equals(a.x, b.x) && this.equals(a.y, b.y);
    }
    pointInLine (point, a, b) {
        return cc.Intersection.pointLineDistance(point, a, b, true) < 1;
    }
    equals (a: number, b: number) {
        return Math.abs(a-b) < this.EPSILON;
    }
    compare(a, b) {
        if (a.fraction > b.fraction) {
            return 1;
        } else if (a.fraction < b.fraction) {
            return -1;
    
        }
        return 0;
    }
}
