
const {ccclass, property} = cc._decorator;

@ccclass
export default class customMask extends cc.Component {
    @property({
        type: cc.Sprite,
    })
    sprite: cc.Sprite= null;
    @property(cc.Graphics)
    ctx:cc.Graphics;
    @property([cc.Node])
    debugNodes:Array<cc.Node> =  [];
    @property([cc.Label])
    labelNodes:Array<cc.Label> =  [];
    material:any = null;
    iTime:number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.updateMaskRender(this.getComponent(cc.PhysicsPolygonCollider).points);
        // this.updateMaskRender(this.getdebugNodes());
    }
    update (dt) {
        // this.drowDebugInfo();
        // this.updateMaskRender(this.getdebugNodes());
    }
    updateMaskRender(pointsArray: cc.Vec2[]){
        // 获取多边形的点
        let pointsPol = pointsArray;
        // 获取材质
        this.material = this.sprite.getMaterial(0);

        this.material.effect.setProperty('Points_Num',pointsPol.length);
        for(var i = 0;i < pointsPol.length;i++){
            this.material.effect.setProperty('pologenPoints_'+(i+1),new cc.Vec2(pointsPol[pointsPol.length-1-i].x/this.sprite.node.width,pointsPol[pointsPol.length-1-i].y/this.sprite.node.height));
        }

        // this.material.effect.setProperty('pologenPoints_1',new cc.Vec2(pointsPol[5].x/this.sprite.node.width,pointsPol[5].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_2',new cc.Vec2(pointsPol[4].x/this.sprite.node.width,pointsPol[4].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_3',new cc.Vec2(pointsPol[3].x/this.sprite.node.width,pointsPol[3].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_4',new cc.Vec2(pointsPol[2].x/this.sprite.node.width,pointsPol[2].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_5',new cc.Vec2(pointsPol[1].x/this.sprite.node.width,pointsPol[1].y/this.sprite.node.height));
        // this.material.effect.setProperty('pologenPoints_6',new cc.Vec2(pointsPol[0].x/this.sprite.node.width,pointsPol[0].y/this.sprite.node.height));
    }
    getdebugNodes(){
        let result = [];
        for(let i = 0;i<this.debugNodes.length;i++){
            result.push(this.debugNodes[i].position);
        }
        return result;
    }
    drowDebugInfo(){
        for (let i = 0; i < this.labelNodes.length; i++) {
            this.labelNodes[i].node.active = false;
        }

        let pointsPol = this.getComponent(cc.PhysicsPolygonCollider).points;

        if(this.ctx){
            this.ctx.clear();
            for (let i = 0; i < pointsPol.length; i++) {
                let p = pointsPol[i];
                // p = this.node.convertToWorldSpaceAR(p);
                this.ctx.circle(p.x, p.y, 5);
                if(this.labelNodes[i]){
                    this.labelNodes[i].node.position = p;
                    this.labelNodes[i].node.active = true;
                    this.labelNodes[i].string = i+1+"";
                }
            }  
            this.ctx.fill();
        }
    }
}
