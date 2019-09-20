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
export default class physicalBounder extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    onLoad () {

    }

    start () {
        let width = this.node.width;
        let height = this.node.height;
        let node = new cc.Node();

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        this.addBound(node,0,height/2,width,20);
        this.addBound(node,0,-height/2,width,20);
        this.addBound(node,-width/2,0,20,height);
        this.addBound(node,width/2,0,20,height);

        node.parent = this.node;
    }

    // update (dt) {}

    private addBound(node:cc.Node,x: number,y: number,width: number,height: number){
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    }
}
