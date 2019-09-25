
const {ccclass, property} = cc._decorator;

@ccclass
export default class customMask extends cc.Component {
    @property({
        type: cc.Sprite,
    })
    sprite: cc.Sprite= null;
    @property(cc.Graphics)
    ctx:cc.Graphics;
    @property([cc.Node])
    debugNodes:Array<cc.Node> =  [];
    @property([cc.Label])
    labelNodes:Array<cc.Label> =  [];
    material:any = null;
    iTime:number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.updateMaskRender(this.getComponent(cc.PhysicsPolygonCollider).points);
        // this.updateMaskRender(this.getdebugNodes());
    }
    update (dt) {
        // this.drowDebugInfo();
        // this.updateMaskRender(this.getdebugNodes());
    }
    updateMaskRender(pointsArray: cc.Vec2[]){
        // 获取多边形的点
        let pointsPol = pointsArray;
        // let pointsPol = this.ClockwiseSortPoints(pointsArray);
        // 获取材质
        this.material = this.sprite.getMaterial(0);

        this.material.effect.setProperty('Points_Num',pointsPol.length);
        for(var i = 0;i < pointsPol.length;i++){
            this.material.effect.setProperty('pologenPoints_'+(i+1),new cc.Vec2(pointsPol[pointsPol.length-1-i].x/this.sprite.node.width,pointsPol[pointsPol.length-1-i].y/this.sprite.node.height));
        }

        // this.material.effect.setProperty('pologenPoints_1',new cc.Vec2(pointsPol[5].x/this.sprite.node.width,pointsPol[5].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_2',new cc.Vec2(pointsPol[4].x/this.sprite.node.width,pointsPol[4].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_3',new cc.Vec2(pointsPol[3].x/this.sprite.node.width,pointsPol[3].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_4',new cc.Vec2(pointsPol[2].x/this.sprite.node.width,pointsPol[2].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_5',new cc.Vec2(pointsPol[1].x/this.sprite.node.width,pointsPol[1].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_6',new cc.Vec2(pointsPol[0].x/this.sprite.node.width,pointsPol[0].y/this.sprite.node.height));
    }
    getdebugNodes(){
        let result = [];
        for(let i = 0;i<this.debugNodes.length;i++){
            result.push(this.debugNodes[i].position);
        }
        // result = this.ClockwiseSortPoints(result);
        return result;
    }
    drowDebugInfo(){
        for (let i = 0; i < 6; i++) {
            this.labelNodes[i].node.active = false;
        }

        let pointsPol = this.getComponent(cc.PhysicsPolygonCollider).points;

        if(this.ctx){
            this.ctx.clear();
            for (let i = 0; i < pointsPol.length; i++) {
                let p = pointsPol[i];
                // p = this.node.convertToWorldSpaceAR(p);
                this.ctx.circle(p.x, p.y, 5);
                this.labelNodes[i].node.position = p;
                this.labelNodes[i].node.active = true;
                this.labelNodes[i].string = i+1+"";
            }  
            this.ctx.fill();
        }
    }
    ClockwiseSortPoints(SrcvPoints: Array<cc.Vec2>) {
        let vPoints = SrcvPoints.concat([]);
        //计算重心
        let center: cc.Vec2 = cc.Vec2.ZERO;
        let X = 0, Y = 0;
        for (let i = 0; i < vPoints.length; i++) {
            X += vPoints[i].x;
            Y += vPoints[i].y;
        }
        center.x = Math.floor(X) / vPoints.length;
        center.y = Math.floor(Y) / vPoints.length;
        //冒泡排序
        for (let i = 0; i < vPoints.length - 1; i++)
        {
            for (let j = 0; j < vPoints.length; j++)
            {
                if (j < vPoints.length - 1) {
                    if (this.PointCmp(vPoints[j], vPoints[j + 1], center)) {
                        let tmp = vPoints[j];
                        vPoints[j] = vPoints[j + 1];
                        vPoints[j + 1] = tmp;
                    }
                }else {
                    if (this.PointCmp(vPoints[j], vPoints[0], center)) {
                        let tmp = vPoints[j];
                        vPoints[j] = vPoints[0];
                        vPoints[0] = tmp;
                    }
                }
            }
        }

        return vPoints;
    }
    //若点a大于点b,即点a在点b顺时针方向,返回true,否则返回false
    PointCmp(a: cc.Vec2, b: cc.Vec2, center: cc.Vec2) {
        if (a.x >= 0 && b.x < 0)
            return true;
        //向量OA和向量OB的叉积
        let det = Math.floor((a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y));
        if (det < 0)
            return true;
        if (det > 0)
            return false;
        //向量OA和向量OB共线，以距离判断大小
        let d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
        let d2 = (b.x - center.x) * (b.x - center.y) + (b.y - center.y) * (b.y - center.y);
        return d1 > d2;
    }
}
