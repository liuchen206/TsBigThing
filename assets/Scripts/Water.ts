
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    waterPrefab:cc.Prefab;
    @property(cc.Node)
    generatePoint:cc.Node;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    }

    start () {
        // this.generateNewCell(300);
    }

    // update (dt) {}

    generateNewCell(num:number){
        for(var i =0;i < num;i++){
            let cellNode = cc.instantiate(this.waterPrefab);
            cellNode.parent = this.node;
            cellNode.x = this.generatePoint.x;
            cellNode.y = this.generatePoint.y+i*20;;
        }
    }
}
