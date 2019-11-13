import { MakeXYToKey } from "./Tools";
import tileFloor from "./tileFloor";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapIsometric extends cc.Component {

    tileSpriteWidth: number = 111;
    tileSpriteHeight: number = 128;
    plantformHeight: number = 65;
    tilesMap: Map<string, cc.Node> = new Map<string, cc.Node>();
    tilesMapSecond: Map<string, cc.Node> = new Map<string, cc.Node>();

    @property(cc.Prefab)
    tilePrefab: cc.Prefab;
    @property(cc.Prefab)
    tilePrefabSecond: cc.Prefab;
    @property(cc.Node)
    secondTileLayer:cc.Node;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |cc.PhysicsManager.DrawBits.e_jointBit |cc.PhysicsManager.DrawBits.e_shapeBit;
    }

    start() {
        this.setTile(0, 0);
        this.setTile(1, 0);
        this.setTile(0, 1);
        this.setTile(1, 1);
        this.setTile(2, 0);
        this.reorderTileZOrder(50,50);

        // this.setTileSecond(0, 0);
        // this.setTileSecond(1, 0);
        // this.setTileSecond(0, 1);
        // this.setTileSecond(1, 1);
        // this.setTileSecond(2, 0);
        // this.reorderTileSecondLayerZOrder(50,50);
    }

    // update (dt) {}

    resetSelect(){
        this.tilesMap.forEach((value , key) => {
            let tile = value;
            (tile.getComponent("tileFloor") as tileFloor).lightUp(false);
        });
        this.tilesMapSecond.forEach((value , key) => {
            let tile = value;
            (tile.getComponent("tileFloor") as tileFloor).lightUp(false);
        });
    }

    setTile(x: number, y: number) {
        let tile = cc.instantiate(this.tilePrefab);
        (tile.getComponent("tileFloor") as tileFloor).xMapIndex = x;
        (tile.getComponent("tileFloor") as tileFloor).yMapIndex = y;
        (tile.getComponent("tileFloor") as tileFloor).mapFloor = 1;
        tile.parent = this.node;
        this.setTilePostion(tile, x, y);
        this.tilesMap.set(MakeXYToKey(x, y), tile);
        return tile;
    }
    setTileSecond(x: number, y: number) {
        let tile = cc.instantiate(this.tilePrefabSecond);
        (tile.getComponent("tileFloor") as tileFloor).xMapIndex = x;
        (tile.getComponent("tileFloor") as tileFloor).yMapIndex = y;
        (tile.getComponent("tileFloor") as tileFloor).mapFloor = 2;
        tile.parent = this.secondTileLayer;
        this.setTilePostion(tile, x, y);
        this.tilesMapSecond.set(MakeXYToKey(x, y), tile);
        return tile;
    }
    convertIndexToPostion(x: number, y: number) {
        let result = new cc.Vec2(0, 0);
        result.x = (x + y) * this.tileSpriteWidth / 2;
        result.y = (y - x) * this.plantformHeight / 2;
        return result;
    }
    setTilePostion(tileNode: cc.Node, x: number, y: number) {
        tileNode.position = this.convertIndexToPostion(x, y);
    }
    reorderTileZOrder(xMax: number, yMax: number) {
        // 远处的要后绘制
        let limitCounter = 0;
        for (let x = 0; x < xMax; x++) {
            limitCounter += xMax;
            for (let y = 0; y < yMax; y++) {
                let targetTile = this.tilesMap.get(MakeXYToKey(x, y));
                if(targetTile){
                    targetTile.zIndex = limitCounter;
                    limitCounter--;
                }
            }
        }
    }
    reorderTileSecondLayerZOrder(xMax: number, yMax: number) {
        // 远处的要后绘制
        let limitCounter = 0;
        for (let x = 0; x < xMax; x++) {
            limitCounter += xMax;
            for (let y = 0; y < yMax; y++) {
                let targetTile = this.tilesMapSecond.get(MakeXYToKey(x, y));
                if(targetTile){
                    targetTile.zIndex = limitCounter;
                    limitCounter--;
                }
            }
        }
    }
}
