
const {ccclass, property} = cc._decorator;

@ccclass
export default class Water extends cc.Component {

    @property(cc.Prefab)
    waterPrefab:cc.Prefab;
    @property(cc.Node)
    generatePoint:cc.Node;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    }

    start () {
        this.generateNewCell(3,this.generatePoint.position);
    }

    // update (dt) {}

    generateNewCell(num:number,pos:cc.Vec2){
        for(var i =0;i < num;i++){
            cc.log("generateNewCell")
            let cellNode = cc.instantiate(this.waterPrefab);
            cellNode.parent = this.node;
            cellNode.x = pos.x+Math.random()*100;
            cellNode.y = pos.y+Math.random()*100;
            cellNode.getComponent(cc.RigidBody).applyLinearImpulse(new cc.Vec2(Math.random()*100-50,Math.random()*100-50),cellNode.getComponent(cc.RigidBody).getLocalCenter(),true);
        }
    }
}
