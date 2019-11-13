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
export default class tileFloor extends cc.Component {
    xMapIndex:number = 0;
    yMapIndex:number = 0;
    mapFloor:number = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this, true); 
    }

    start () {

    }

    // update (dt) {}

    onTouchStartCallback(event){
        cc.log("onTouchStartCallback pos",event.getLocation().toString(),"xIndex",this.xMapIndex,"yIndex",this.yMapIndex,"mapFloor",this.mapFloor);
        this.lightUp(true);
    }

    lightUp(isSelect){
        // 当被选中时
        if(isSelect == true){
            this.node.color = cc.Color.BLACK;
        }else{
            this.node.color = cc.Color.WHITE;
        }
    }
}
