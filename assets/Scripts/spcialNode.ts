
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property({
        type: cc.Sprite,
    })
    sprite: cc.Sprite;
    material:any;
    iTime:number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        // 获取材质
        this.material = this.sprite.getMaterial(0);
        this.material.effect.setProperty('iTime', 0.0);
        this.material.effect.setProperty('nodeWidth', this.sprite.node.width);
        this.material.effect.setProperty('nodeHeight', this.sprite.node.height);
    }

    update (dt) {
        this.iTime += dt;
        this.material.effect.setProperty('iTime', this.iTime);
    }
}
