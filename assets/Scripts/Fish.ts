import { LcLog, LcFract, MapNum } from "./Tools";

const { ccclass, property } = cc._decorator;

class TouchingState {
    private isActive: boolean = false;
    private touchPos: cc.Vec2 = cc.Vec2.ZERO;

    IsActive(): boolean {
        return this.isActive;
    }
    setActive(x: number, y: number) {
        this.isActive = true;
        this.touchPos.x = x;
        this.touchPos.y = y;
    }
    getTouchPosX() {
        return this.touchPos.x;
    }
    getTouchPosY() {
        return this.touchPos.y;
    }
    inActive() {
        this.isActive = false;
        this.touchPos.x = 0;
        this.touchPos.y = 0;
    }
}

@ccclass
export default class Fish extends cc.Component {
    MAX_ACC: number = 3.;
    MAX_VEL: number = .5;
    RESIST: number = .2;
    Resolution: cc.Vec2 = cc.Vec2.ZERO;
    Vel: cc.Vec2 = cc.Vec2.ZERO;
    Acc: cc.Vec2 = cc.Vec2.ZERO;
    SumF: cc.Vec2 = cc.Vec2.ZERO;
    touchState: TouchingState;

    id: number;
    mapWidth: number; // 地图总宽
    mapHeight: number; // 地图总长
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    // start () {
    // }
    // update (dt) {
    //     this.DoStreeing(dt);
    // }
    init(id) {
        this.id = id;
        cc.Canvas.instance.node.on("touchstart", this.OnTouchDown, this);
        this.touchState = new TouchingState();
        this.mapWidth = cc.view.getVisibleSize().width;
        this.mapHeight = cc.view.getVisibleSize().height;
        this.Resolution = new cc.Vec2(this.mapWidth / this.mapHeight, this.mapHeight / this.mapHeight); // 原方法在此，但是经过尝试（1，1）可以得到正确效果
        this.Resolution = new cc.Vec2(1,1); 
        this.node.x = MapNum(Math.random(),0,1,0,this.mapWidth);
        this.node.y = MapNum(Math.random(),0,1,0,this.mapHeight);
    }
    DoStreeing(dt): cc.Vec2 {

        // Borders action
        // this.SumF = .8*(1./abs(fish.xy) - 1./abs(res-fish.xy))
        let x = MapNum(this.node.x,0,this.mapWidth,0,1);
        let y = MapNum(this.node.y,0,this.mapHeight,0,1);
        let left = new cc.Vec2(Math.abs(1/x),Math.abs(1/y));
        let right = new cc.Vec2(Math.abs(1/(this.Resolution.x - x)),Math.abs(1/(this.Resolution.y - y)));
        this.SumF = left.sub(right).mul(0.8);
        // Mouse action
        if (this.touchState.IsActive() == true) {
            // LcLog('touchState', this.touchState.getTouchPosX(), this.touchState.getTouchPosY());
            let mouseX = MapNum(this.touchState.getTouchPosX(),0,this.mapWidth,0,1);
            let mouseY = MapNum(this.touchState.getTouchPosY(),0,this.mapHeight,0,1);
            let left = new cc.Vec2(x,y);
            let right = new cc.Vec2(mouseX,mouseY);
            let w:cc.Vec2 = left.sub(right);
            this.SumF.addSelf(w.normalize().mul(.65).mul(1/w.dot(w)));
        }
        // Calculate repulsion force with other fishs
        for(let i =0;i<this.node.parent.childrenCount;i++){
            let fishNode = this.node.parent.children[i];
            let fishTS:Fish = fishNode.getComponent('Fish');
            if(this.id != fishTS.id){
                let fishIx = MapNum(fishTS.node.x,0,this.mapWidth,0,1);
                let fishIy = MapNum(fishTS.node.y,0,this.mapHeight,0,1);
                let w = new cc.Vec2(x,y).sub(new cc.Vec2(fishIx,fishIy));
                let dis = w.mag();
                if(dis > 0){
                    let fleeForce = w.mul(6.3+Math.log(dis*dis*.02));
                    let a = Math.exp(dis*dis*2.4);
                    fleeForce.mulSelf(1/a);
                    fleeForce.mulSelf(1/dis);
                    this.SumF.subSelf(fleeForce);
                }else{
                    let randForce = 0.01*Math.random();
                    this.SumF.subSelf(new cc.Vec2(randForce,randForce));
                }
            }
        }

        // for(float i=0.;i<NB;i++){
        //     if(i != id) {
        //         d = length(w = fish.xy - Fish(i).xy);
        //         sumF -= d > 0. ? w*(6.3+log(d*d*.02))/exp(d*d*2.4)/d
        //             : .01*hash(id); // if same pos : small ramdom force
        //     }
        // }

        // Friction 计算阻力
        this.SumF.subSelf(this.Vel.mul(this.RESIST).div(dt));

        // - Dynamic calculation ---------------------     
        // Calculate acceleration 计算当前加速度 A = (1/m * sumF) [cool m=1. here!]
        this.Acc = this.SumF;
        this.Acc = this.Acc.mag() > this.MAX_ACC ? this.Acc.normalize().mul(this.MAX_ACC) : this.Acc;
        // Calculate speed 计算当前速度
        this.Vel.addSelf(this.Acc.mul(dt));
        this.Vel = this.Vel.mag() > this.MAX_VEL ? this.Vel.normalize().mul(this.MAX_VEL) : this.Vel;

        // - 移动位置 velocity of fish (xy = position, zw = velocity) 
        this.node.x += MapNum(this.Vel.x,0,this.MAX_VEL,0,this.MAX_VEL*1200) * dt;
        this.node.y += MapNum(this.Vel.y,0,this.MAX_VEL,0,this.MAX_VEL*1200) * dt;

        // 计算朝向（角度）
        var angle = cc.Vec2.RIGHT.signAngle(this.Vel);
        var degree = angle / Math.PI * 180;
        this.node.angle = degree;

        return cc.Vec2.ZERO;
    }
    OnTouchDown(e: cc.Touch) {
        let nx = e.getLocationX();
        let ny = e.getLocationY();
        cc.Canvas.instance.node.on("touchmove", this.OnTouchMove, this);
        cc.Canvas.instance.node.on("touchend", this.OnTouchEnd, this);

        this.touchState.setActive(nx, ny);
    }
    OnTouchMove(e: cc.Touch) {
        let nx = e.getLocationX();
        let ny = e.getLocationY();

        this.touchState.setActive(nx, ny);
    }
    OnTouchEnd(e: cc.Touch) {

        cc.Canvas.instance.node.off("touchmove", this.OnTouchMove, this);
        cc.Canvas.instance.node.off("touchend", this.OnTouchEnd, this);

        this.touchState.inActive();
    }
}
