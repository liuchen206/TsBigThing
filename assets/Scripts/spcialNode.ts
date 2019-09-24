
const {ccclass, property} = cc._decorator;

@ccclass
export default class spcialNode extends cc.Component {
    @property({
        type: cc.Sprite,
    })
    sprite: cc.Sprite= null;
    material:any = null;
    iTime:number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        // 获取材质
        this.material = this.sprite.getMaterial(0);
        this.material.effect.setProperty('iTime', 0.0);
        this.material.effect.setProperty('nodeWidth', this.sprite.node.width);
        this.material.effect.setProperty('nodeHeight', this.sprite.node.height);
        this.material.effect.setProperty('pologenPoints_1',new cc.Vec2(0.1,0.1));
        this.material.effect.setProperty('pologenPoints_2',new cc.Vec2(0.2,0.1));
        this.material.effect.setProperty('pologenPoints_3',new cc.Vec2(0.2,0.2));
        this.material.effect.setProperty('pologenPoints_4',new cc.Vec2(0.1,0.2));
        this.material.effect.setProperty('pologenPoints_5',new cc.Vec2(0.05,0.15));
        this.material.effect.setProperty('Points_Num',5);
    }
    update (dt) {
        this.iTime += dt;
        this.material.effect.setProperty('iTime', this.iTime);
    }
}
