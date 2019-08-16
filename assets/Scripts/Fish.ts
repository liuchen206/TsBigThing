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
enum FishStateType{
    Fresh = 0,
    Bone,
}
enum StreeingStateType{
    Peace = 0,
    Violent,
    Naughty, // TODO 延后实现
}
enum ShoalShape{
    Circle = 0,
    Rect,
}
class FishState{
    private _currentState:FishStateType = FishStateType.Fresh;
    CurrentStreeingState:StreeingStateType = StreeingStateType.Peace;
    CurrentShoalShape:ShoalShape = ShoalShape.Circle;    
    SportRatio:number = 1;
    get CurrentState(){
        return this._currentState;
    }
    set CurrentState(value:FishStateType){
        if(this._currentState != value){
            this._currentState = value;
            if(value = FishStateType.Fresh){
                this.CurrentStreeingState = StreeingStateType.Peace;
                this.SportRatio = 1;
            }
            if(value = FishStateType.Bone){
                this.CurrentStreeingState = StreeingStateType.Violent;
                this.SportRatio = 1.2;
            }
        }
    }
    constructor(){
        this.CurrentState = FishStateType.Fresh;
    }
}

@ccclass
export default class Fish extends cc.Component {
    VelocityScaleRatio:number = 800;
    _MAX_ACC: number = 3.;
    get MAX_ACC(){
        return this._MAX_ACC*this.fishState.SportRatio;
    }
    _MAX_VEL: number = .5;
    get MAX_VEL(){
        return this._MAX_VEL*this.fishState.SportRatio;
    }
    RESIST: number = .2;
    Resolution: cc.Vec2 = cc.Vec2.ZERO;
    Vel: cc.Vec2 = cc.Vec2.ZERO;
    Acc: cc.Vec2 = cc.Vec2.ZERO;
    SumF: cc.Vec2 = cc.Vec2.ZERO;
    touchState: TouchingState;
    fishState: FishState;

    id: number;
    _fishSpriteFrameIndex:number;
    mapWidth: number; // 地图总宽
    mapHeight: number; // 地图总长

    set fishSpriteFrameIndex(value:number){
        if(value >= 0 && value < this.fishFreshSpriteList.length && value < this.fishBoneSpriteList.length){
            this._fishSpriteFrameIndex = value;
        }else{
            this._fishSpriteFrameIndex = 0;
        }
    }
    get fishSpriteFrameIndex(){
        return this._fishSpriteFrameIndex;
    }

    @property(cc.Sprite)
    spriteRender:cc.Sprite;

    @property([cc.SpriteFrame])
    fishFreshSpriteList:cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    fishBoneSpriteList:cc.SpriteFrame[] = [];
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {
    // }
    // start () {
    // }
    // update (dt) {
    //     this.DoStreeing(dt);
    // }
    init(id,fishSpriteFrameIndex) {
        this.id = id;
        this.fishSpriteFrameIndex = fishSpriteFrameIndex;
        cc.Canvas.instance.node.on("touchstart", this.OnTouchDown, this);
        this.node.on("touchstart", this.OnMySelfTouchDown, this);
        this.touchState = new TouchingState();
        this.fishState = new FishState();
        this.mapWidth = cc.view.getVisibleSize().width;
        this.mapHeight = cc.view.getVisibleSize().height;
        // this.Resolution = new cc.Vec2(this.mapWidth / this.mapHeight, this.mapHeight / this.mapHeight); // 原方法在此，但是经过尝试（1，1）可以得到正确效果
        this.Resolution = new cc.Vec2(1,1); 
        this.node.x = MapNum(Math.random(),0,1,0,this.mapWidth);
        this.node.y = MapNum(Math.random(),0,1,0,this.mapHeight);

        this.ChangeRender(this.fishSpriteFrameIndex,this.fishState.CurrentState);
    }
    onCollisionEnter(other, self) {
        // LcLog("onCollisionEnter");
        if(this.fishState.CurrentState == FishStateType.Fresh){
            this.SwitchState(FishStateType.Bone);
        }
    }
    ChangeRender(newSpriteIndex:number,fishStateType:FishStateType){
        if(fishStateType == FishStateType.Fresh){
            this.spriteRender.spriteFrame = this.fishFreshSpriteList[newSpriteIndex];
            this.node.group = "fishfresh";
            // this.node.groupIndex
        }
        if(fishStateType == FishStateType.Bone){
            this.spriteRender.spriteFrame = this.fishBoneSpriteList[newSpriteIndex];
            this.node.group = "fishbone";
        }
    }
    ShoalWithShape(x:number,y:number,shape:ShoalShape){
        for(let i =0;i<this.node.parent.childrenCount;i++){
            let fishNode = this.node.parent.children[i];
            let fishTS:Fish = fishNode.getComponent('Fish');
            if(this.id != fishTS.id){
            // if(this.id != fishTS.id && fishTS.fishState.CurrentState == FishStateType.Fresh){
                let fishIx = MapNum(fishTS.node.x,0,this.mapWidth,0,1);
                let fishIy = MapNum(fishTS.node.y,0,this.mapHeight,0,1);
                let w = new cc.Vec2(x,y).sub(new cc.Vec2(fishIx,fishIy));
                let dis = w.mag();
                if(dis > 0){
                    if(shape == ShoalShape.Circle){
                        let fleeForce = w.mul(6.3+Math.log(dis*dis*.02));
                        let a = Math.exp(dis*dis*2.4);
                        fleeForce.mulSelf(1/a);
                        fleeForce.mulSelf(1/dis);
                        this.SumF.subSelf(fleeForce);
                    }
                    if(shape == ShoalShape.Rect){
                        // TODO
                    }
                }else{
                    let randForce = 0.01*Math.random();
                    this.SumF.subSelf(new cc.Vec2(randForce,randForce));
                }
            }
        }
    }
    FleeWithPostion(x:number,y:number,fleeX:number,fleeY:number){
        let left = new cc.Vec2(x,y);
        let right = new cc.Vec2(fleeX,fleeY);
        let w:cc.Vec2 = left.sub(right);
        this.SumF.addSelf(w.normalize().mul(.65).mul(1/w.dot(w)));
    }
    CatchWithPosition(x:number,y:number,catchX:number,catchY:number){
        let left = new cc.Vec2(x,y);
        let right = new cc.Vec2(catchX,catchY);
        let w:cc.Vec2 = right.sub(left);
        this.SumF.addSelf(w.normalize().mul(.65).mul(1/w.dot(w)));
    }
    getNearestBoneFish(x:number,y:number){
        let shorestDistance = 1;
        let targetFishTS:Fish;
        for(let i =0;i<this.node.parent.childrenCount;i++){
            let fishNode = this.node.parent.children[i];
            let fishTS:Fish = fishNode.getComponent('Fish');
            if(this.id != fishTS.id && fishTS.fishState.CurrentState == FishStateType.Bone){
                let fishIx = MapNum(fishTS.node.x,0,this.mapWidth,0,1);
                let fishIy = MapNum(fishTS.node.y,0,this.mapHeight,0,1);
                let w = new cc.Vec2(x,y).sub(new cc.Vec2(fishIx,fishIy));
                let dis = w.mag();
                if(dis < shorestDistance){
                    shorestDistance = dis;
                    targetFishTS = fishTS;
                }
            }
        }
        return targetFishTS;
    }
    getNearestFreshFish(x:number,y:number){
        let shorestDistance = 1;
        let targetFishTS:Fish;
        for(let i =0;i<this.node.parent.childrenCount;i++){
            let fishNode = this.node.parent.children[i];
            let fishTS:Fish = fishNode.getComponent('Fish');
            if(this.id != fishTS.id && fishTS.fishState.CurrentState == FishStateType.Fresh){
                let fishIx = MapNum(fishTS.node.x,0,this.mapWidth,0,1);
                let fishIy = MapNum(fishTS.node.y,0,this.mapHeight,0,1);
                let w = new cc.Vec2(x,y).sub(new cc.Vec2(fishIx,fishIy));
                let dis = w.mag();
                if(dis < shorestDistance){
                    shorestDistance = dis;
                    targetFishTS = fishTS;
                }
            }
        }
        return targetFishTS;
    }
    DoStreeing(dt): cc.Vec2 {
        // Borders action 默认行为（碰到边界返回屏幕中心--- 整个生命周期中一直生效） 
        // this.SumF = .8*(1./abs(fish.xy) - 1./abs(res-fish.xy))
        let x = MapNum(this.node.x,0,this.mapWidth,0,1);
        let y = MapNum(this.node.y,0,this.mapHeight,0,1);
        let left = new cc.Vec2(Math.abs(1/x),Math.abs(1/y));
        let right = new cc.Vec2(Math.abs(1/(this.Resolution.x - x)),Math.abs(1/(this.Resolution.y - y)));
        this.SumF = left.sub(right).mul(0.8);

        /***
         *  状态化分如下：
         * 1， Fresh 状态下允许 Peace 和 Naughty 两种拓展行为
         * 2， Bone 状态下允许 Violent 一种拓展行为
         * 
         *  除了默认行为，其他行为细分如下：
         * 
         *  1， 在 Peace 行为下 --群聚形状（圆形，方形等） --躲避危险
         *  2， 在 Naughty 行为下 TODO
         *  3,  在 Violent 行为下 -- 捕食其他 fish
         * */ 
        if(this.fishState.CurrentState == FishStateType.Fresh){
            if(this.fishState.CurrentStreeingState == StreeingStateType.Peace){
                // Calculate repulsion force with other fishs
                this.ShoalWithShape(x,y,this.fishState.CurrentShoalShape);

                // Mouse action
                if (this.touchState.IsActive() == true) {
                    let mouseX = MapNum(this.touchState.getTouchPosX(),0,this.mapWidth,0,1);
                    let mouseY = MapNum(this.touchState.getTouchPosY(),0,this.mapHeight,0,1);
                    this.FleeWithPostion(x,y,mouseX,mouseY);
                }

                let targetFishTS = this.getNearestBoneFish(x,y);
                if(targetFishTS != null){
                    let fleeX = MapNum(targetFishTS.node.x,0,this.mapWidth,0,1);
                    let fleeY = MapNum(targetFishTS.node.y,0,this.mapHeight,0,1);
                    this.FleeWithPostion(x,y,fleeX,fleeY);
                }
            }
            if(this.fishState.CurrentStreeingState == StreeingStateType.Naughty){
                
            }
        }
        if(this.fishState.CurrentState == FishStateType.Bone){
            this.ShoalWithShape(x,y,this.fishState.CurrentShoalShape);
            // if (this.touchState.IsActive() == true) {
            //     let mouseX = MapNum(this.touchState.getTouchPosX(),0,this.mapWidth,0,1);
            //     let mouseY = MapNum(this.touchState.getTouchPosY(),0,this.mapHeight,0,1);
            //     this.CatchWithPosition(x,y,mouseX,mouseY);
            // }

            let targetFishTS = this.getNearestFreshFish(x,y);
            if(targetFishTS != null){
                let catchX = MapNum(targetFishTS.node.x,0,this.mapWidth,0,1);
                let catchY = MapNum(targetFishTS.node.y,0,this.mapHeight,0,1);
                this.CatchWithPosition(x,y,catchX,catchY);
            }
        }

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
        this.node.x += MapNum(this.Vel.x,0,this.MAX_VEL,0,this.MAX_VEL*this.VelocityScaleRatio) * dt;
        this.node.y += MapNum(this.Vel.y,0,this.MAX_VEL,0,this.MAX_VEL*this.VelocityScaleRatio) * dt;

        let positionLimitEdge = 50 
        if(this.node.x < -positionLimitEdge){
            this.node.x = this.mapWidth+positionLimitEdge;
        }
        if(this.node.x > this.mapWidth+positionLimitEdge){
            this.node.x = -positionLimitEdge;
        }
        if(this.node.y < -positionLimitEdge){
            this.node.y = this.mapHeight+positionLimitEdge;
        }
        if(this.node.y > this.mapHeight+positionLimitEdge){
            this.node.y = -positionLimitEdge;
        }

        // 计算朝向（角度）
        var angle = cc.Vec2.RIGHT.signAngle(this.Vel);
        var degree = angle / Math.PI * 180;
        this.node.angle = degree;

        return cc.Vec2.ZERO;
    }
    SwitchState(fishStateType:FishStateType){
        if(fishStateType != this.fishState.CurrentState){
            this.ChangeRender(this.fishSpriteFrameIndex,fishStateType);
            this.fishState.CurrentState = fishStateType;
        }
    }
    OnMySelfTouchDown(e: cc.Touch) {
        LcLog('OnMySelfTouchDowne' ,this.id);
        if(FishStateType.Bone == this.fishState.CurrentState){
            this.SwitchState(FishStateType.Fresh);
        }else if(FishStateType.Fresh == this.fishState.CurrentState){
            this.SwitchState(FishStateType.Bone);
        }
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
