
const {ccclass, property} = cc._decorator;

@ccclass
export default class Dragable extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this, true); 
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoveCallback, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancelCallback, this, true);
    }

    start () {

    }

    // update (dt) {}

    onTouchStartCallback(event){
        // cc.log("onTouchStartCallback pos",event.getLocation().toString());
    }
    onTouchMoveCallback(event){
        // cc.log("onTouchMoveCallback pos",event.getLocation().toString());
        var localPos = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        this.node.position = localPos;
    }
    onTouchEndCallback(event){
        // cc.log("onTouchEndCallback pos",event.getLocation().toString());
    }
    onTouchCancelCallback(event){
        // cc.log("onTouchCancelCallback pos",event.getLocation().toString());
    }
}
