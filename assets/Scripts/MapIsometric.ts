import { MakeXYToKey } from "./Tools";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapIsometric extends cc.Component {

    tileSpriteWidth:number = 111;
    tileSpriteHeight:number = 128;
    plantformHeight:number = 65;
    tilesMap:Map<string,cc.Node> = new Map<string,cc.Node>();

    @property(cc.Prefab)
    tilePrefab:cc.Prefab;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |cc.PhysicsManager.DrawBits.e_jointBit |cc.PhysicsManager.DrawBits.e_shapeBit;
    }

    start () {
        // this.createTile(0,0);
        this.createTile(0,2);
        // this.createTile(1,1);
        this.createTile(2,0);
        this.createTile(0,-2);
        // this.createTile(-1,-1);
        this.createTile(-2,0);
    }

    // update (dt) {}
    reorderTile(){

    }
    createTile(x:number,y:number){
        let tile = cc.instantiate(this.tilePrefab);
        tile.parent = this.node;
        this.setTilePostion(tile,x,y);
        this.tilesMap.set(MakeXYToKey(x,y),tile);
    }
    convertIndexToPostion(x:number,y:number){
        let result = new cc.Vec2(0,0);
        result.x = (x + y) * this.tileSpriteWidth / 2;
        result.y = (y - x) * this.plantformHeight / 2;
        return result;
    }
    setTilePostion(tileNode:cc.Node,x:number,y:number){
        tileNode.position = this.convertIndexToPostion(x,y);
    }
}
