import { MakeXYToKey } from "./Tools";
import tileFloor, { movingDir } from "./tileFloor";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapIsometric extends cc.Component {

    tileSpriteWidth: number = 111;
    tileSpriteHeight: number = 128;
    plantformHeight: number = 65;
    mapLengthX: number = 6;
    mapLengthY: number = 6;
    tilesMapFirst: Map<string, cc.Node> = new Map<string, cc.Node>();
    tilesMapSecond: Map<string, cc.Node> = new Map<string, cc.Node>();
    currentSelectedTile: cc.Node = null;

    @property(cc.Prefab)
    tilePrefab: cc.Prefab;
    @property(cc.Prefab)
    tilePrefabSecond: cc.Prefab;
    @property(cc.Node)
    secondTileLayer: cc.Node;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |cc.PhysicsManager.DrawBits.e_jointBit |cc.PhysicsManager.DrawBits.e_shapeBit;
    }

    start() {
        let initMap = [];
        for (var i = 0; i < this.mapLengthX; i++) {
            for (var j = 0; j < this.mapLengthY; j++) {
                initMap.push(new cc.Vec2(i, j));
            }
        }
        this.setFirstFloor(initMap);
        this.setSecondFloor([new cc.Vec2(0, 0), new cc.Vec2(0, 1), new cc.Vec2(0, 2), new cc.Vec2(0, 3), new cc.Vec2(0, 4)]);

        this.node.x = -(this.mapLengthX-1)*this.tileSpriteWidth/2;
        this.secondTileLayer.x = this.node.x;
    }

    // update (dt) {}
    setFirstFloor(indexList: Array<cc.Vec2>) {
        indexList.forEach(pos => {
            this.setTileFirst(pos);
        });
        this.reorderTileFirstZOrder(this.mapLengthX, this.mapLengthY);
    }
    setSecondFloor(indexList: Array<cc.Vec2>) {
        indexList.forEach(pos => {
            this.setTileSecond(pos);
        });
        this.reorderTileSecondLayerZOrder(this.mapLengthX, this.mapLengthY);
    }
    resetSelect() {
        this.tilesMapFirst.forEach((value, key) => {
            let tile = value;
            (tile.getComponent("tileFloor") as tileFloor).lightDown();
        });
        this.tilesMapSecond.forEach((value, key) => {
            let tile = value;
            (tile.getComponent("tileFloor") as tileFloor).lightDown();
        });
    }

    setTileFirst(pos: cc.Vec2) {
        let x = pos.x;
        let y = pos.y;
        let tile = cc.instantiate(this.tilePrefab);
        (tile.getComponent("tileFloor") as tileFloor).xMapIndex = x;
        (tile.getComponent("tileFloor") as tileFloor).yMapIndex = y;
        (tile.getComponent("tileFloor") as tileFloor).mapFloor = 1;
        tile.parent = this.node;
        this.setTilePostion(tile, x, y);
        this.tilesMapFirst.set(MakeXYToKey(x, y), tile);
        return tile;
    }
    setTileSecond(pos: cc.Vec2) {
        let x = pos.x;
        let y = pos.y;
        let tile = cc.instantiate(this.tilePrefabSecond);
        (tile.getComponent("tileFloor") as tileFloor).xMapIndex = x;
        (tile.getComponent("tileFloor") as tileFloor).yMapIndex = y;
        (tile.getComponent("tileFloor") as tileFloor).mapFloor = 2;
        if (y == 0) {
            (tile.getComponent("tileFloor") as tileFloor).movingDir = movingDir.xAxis;
        } else if (y == 1) {
            (tile.getComponent("tileFloor") as tileFloor).movingDir = movingDir.yAxis;
        } else if (y == 2) {
            (tile.getComponent("tileFloor") as tileFloor).movingDir = movingDir.LeftRightAxis;
        } else if (y == 3) {
            (tile.getComponent("tileFloor") as tileFloor).movingDir = movingDir.UpDownAxis;
        } else if (y == 4) {
            (tile.getComponent("tileFloor") as tileFloor).movingDir = movingDir.any;
        }
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
    reorderTileFirstZOrder(xMax: number, yMax: number) {
        // 远处的要后绘制
        let limitCounter = 0;
        for (let x = 0; x < xMax; x++) {
            limitCounter += yMax;
            for (let y = 0; y < yMax; y++) {
                let targetTile = this.tilesMapFirst.get(MakeXYToKey(x, y));
                if (targetTile) {
                    targetTile.zIndex = limitCounter;
                    // (targetTile.getComponent("tileFloor") as tileFloor).setInof(limitCounter + "");
                    (targetTile.getComponent("tileFloor") as tileFloor).setInof("(" + x + "," + y + ")");
                    limitCounter--;
                }
            }
        }
    }
    reorderTileSecondLayerZOrder(xMax: number, yMax: number) {
        // 远处的要后绘制
        let limitCounter = 0;
        for (let x = 0; x < xMax; x++) {
            limitCounter += yMax;
            for (let y = 0; y < yMax; y++) {
                let targetTile = this.tilesMapSecond.get(MakeXYToKey(x, y));
                if (targetTile) {
                    targetTile.zIndex = limitCounter;
                    limitCounter--;
                }
            }
        }
    }
}
