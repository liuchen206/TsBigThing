import Fish from "./Fish";
import { LcLog } from "./Tools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    @property
    FishsNum:number = 1;
    @property(cc.Prefab)
    FishPrefab:cc.Prefab = null;


    start () {  
        this.init();
    }

    update (dt) {
        for(let i =0;i<this.node.childrenCount;i++){
            let fishNode = this.node.children[i];
            let fishTS:Fish = fishNode.getComponent('Fish');
            fishTS.DoStreeing(dt);
        }
    }

    init(){
        for(let i = 0;i< this.FishsNum;i++){
            let fish = cc.instantiate(this.FishPrefab);
            this.node.addChild(fish);
        }
        for(let i =0;i<this.node.childrenCount;i++){
            // LcLog("fish index ",i);
            let fishNode = this.node.children[i];
            let fishTS:Fish = fishNode.getComponent('Fish');
            fishTS.init(i,i);
        }
    }
}
