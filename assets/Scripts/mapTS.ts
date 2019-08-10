import { TileBase } from "./Tile";
import { TileType, OperateTileType } from "./ConstantsDefine";
import { SearchParameters, AstarPathFinding } from "./AstarPathFinding";

const { ccclass, property } = cc._decorator;

class SearchNode {
    version: boolean = false;
    x: number = 0;
    y: number = 0;
    links: Array<SearchNode>;
    linksLength: number = 0;
    parent: SearchNode = null//MapInfo
    nowCost: number = 0;
    mayCost: number = 0;
    next: SearchNode = null;//MapInfo
    pre: SearchNode = null;//MapInfo
    dist: number = 0;
    constructor(nx: number, ny: number) {
        this.x = nx;
        this.y = ny;
    }
    addLinks(mapObj: object) {
        this.links = new Array<SearchNode>();
        if (this.x > 0) {
            this.addL((this.x - 1), this.y, mapObj);
        }
        if (this.y > 0) {
            this.addL(this.x, (this.y - 1), mapObj);
        }
        this.addL((this.x + 1), this.y,  mapObj);
        this.addL(this.x, (this.y + 1), mapObj);
    }
    addL(tx: number, ty: number,  mapObj: object) {
        let id = tx + "*" + ty;
        if (mapObj[id] == null) {
            this.links.push(new SearchNode(tx, ty));
            this.linksLength++;
        }else if(mapObj[id].Walkable == true){
            this.links.push(new SearchNode(tx, ty));
            this.linksLength++;
        }
    }
}

@ccclass
export default class mapTS extends cc.Component {

    graphics: cc.Graphics;
    mapGridWidth: number = 20; // 地图中单元网格宽
    mapGridHeigth: number = 20; // 地图中单元网格高
    mapWidth: number; // 地图总宽
    mapHeight: number; // 地图总长
    mapStartPosX: number; // 地图绘制起点x
    mapStartPosY: number; // 地图绘制起点y
    pathObj: object;
    startTile: TileBase; // 寻路测试起点
    endTile: TileBase; // 寻路测试终点
    bgTile: TileBase; // 地图背景
    inputOperateType: OperateTileType; // 用户输入后，执行的操作类型
    selectedTile: TileBase;

    _tileNumX: number;
    _tileNumY: number;
    get tileNumX() {
        this._tileNumX = Math.ceil(this.mapWidth / this.mapGridWidth);
        return this._tileNumX;
    }
    get tileNumY() {
        this._tileNumY = Math.ceil(this.mapHeight / this.mapGridHeigth);
        return this._tileNumY;
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.init();
        this.graphics = this.node.addComponent(cc.Graphics);
        this.renderMap();
    }

    // update (dt) {}
    init() {
        this.inputOperateType = OperateTileType.None;
        this.mapWidth = cc.view.getVisibleSize().width;
        this.mapHeight = cc.view.getVisibleSize().height;
        this.mapStartPosX = cc.view.getVisibleOrigin().x;
        this.mapStartPosY = cc.view.getVisibleOrigin().y;
        this.startTile = new TileBase(this.mapGridWidth, this.mapGridHeigth, 5, 10, cc.color(0, 255, 100), TileType.testType);
        this.endTile = new TileBase(this.mapGridWidth, this.mapGridHeigth, 8, 11, cc.color(255, 0, 0), TileType.testType);
        this.bgTile = new TileBase(this.mapWidth, this.mapHeight, this.mapStartPosX, this.mapStartPosY, cc.color(255, 255, 255), TileType.default);
        this.pathObj = {};
        this.pathObj[this.startTile.posX + "*" + this.startTile.posY] = this.startTile;
        this.pathObj[this.endTile.posX + "*" + this.endTile.posY] = this.endTile;
        cc.Canvas.instance.node.on("mousedown", this.OnMouseDown, this);
    }
    OnMouseDown(e: cc.Touch) {
        let nx = Math.floor(e.getLocationX() / this.mapGridWidth);
        let ny = Math.floor(e.getLocationY() / this.mapGridHeigth);
        cc.log('OnMouseDown', nx, ny);
        if (this.pathObj[nx + "*" + ny] != null) {
            this.selectedTile = this.pathObj[nx + "*" + ny];
            if (this.selectedTile.Dragable == true) {
                this.inputOperateType = OperateTileType.Move;
            } else if (this.selectedTile.Deleteable == true) {
                this.inputOperateType = OperateTileType.Delete;
            }
        } else {
            this.inputOperateType = OperateTileType.Add;
        }
        cc.Canvas.instance.node.on("mouseup", this.OnMouseUp, this);
        cc.Canvas.instance.node.on("mousemove", this.OnMouseMove, this);
    }
    OnMouseUp(e: cc.Touch) {
        cc.Canvas.instance.node.off("mouseup", this.OnMouseUp, this);
        cc.Canvas.instance.node.off("mousemove", this.OnMouseMove, this);
        this.inputOperateType = OperateTileType.None;
        this.selectedTile = null;
    }
    OnMouseMove(e: cc.Touch) {
        let nx = Math.floor(e.getLocationX() / this.mapGridWidth);
        let ny = Math.floor(e.getLocationY() / this.mapGridHeigth);
        if (this.inputOperateType == OperateTileType.Move) {
            if (this.pathObj[nx + "*" + ny] == null) {
                if (this.selectedTile.posX != nx || this.selectedTile.posY != ny) {
                    this.pathObj[this.selectedTile.posX + "*" + this.selectedTile.posY] = null;
                    this.selectedTile.posX = nx;
                    this.selectedTile.posY = ny;
                    this.pathObj[nx + "*" + ny] = this.selectedTile;
                    this.renderMap();
                }
            }
        }
        if (this.inputOperateType == OperateTileType.Add) {
            if (this.pathObj[nx + "*" + ny] == null) {
                this.pathObj[nx + "*" + ny] = new TileBase(this.mapGridWidth, this.mapGridHeigth, nx, ny, cc.color(150, 150, 150), TileType.obstruct);
                this.renderMap();
            } else {
                if (this.pathObj[nx + "*" + ny].Deleteable == true) {
                    this.pathObj[nx + "*" + ny] = new TileBase(this.mapGridWidth, this.mapGridHeigth, nx, ny, cc.color(150, 150, 150), TileType.obstruct);
                    this.renderMap();
                }
            }
        }
        if (this.inputOperateType == OperateTileType.Delete) {
            if (this.pathObj[nx + "*" + ny] == null) {

            } else {
                if (this.pathObj[nx + "*" + ny].Deleteable == true) {
                    this.pathObj[nx + "*" + ny] = null;
                    this.renderMap();
                }
            }
        }

    }
    renderMap() {
        this.graphics.clear();
        this.renderTile(this.bgTile);
        for (let y = this.mapStartPosY; y < this.tileNumY; y++) {
            for (let x = this.mapStartPosX; x < this.tileNumX; x++) {
                if (this.pathObj[x + "*" + y] != null) {
                    this.renderTile(this.pathObj[x + "*" + y]);
                }
                this.graphics.strokeColor = cc.color(150, 150, 150);
                this.graphics.rect(this.mapGridWidth * x, this.mapGridHeigth * y, this.mapGridWidth, this.mapGridHeigth);
                this.graphics.stroke();
            }
        }


        let a = new SearchParameters(new cc.Vec2(this.startTile.posX,this.startTile.posY),new cc.Vec2(this.endTile.posX,this.endTile.posY),this.pathObj,this.tileNumX,this.tileNumY);
        let b = new AstarPathFinding(a);
        let path = b.ShowMeThePath();
        if (path != null){
            if (path.length > 1){
                let b = this.mapGridWidth / 2;
                let p = new Array(path.length);
                this.graphics.strokeColor = cc.Color.BLUE;
                this.graphics.moveTo(path[0].x * this.mapGridWidth+ b, path[0].y * this.mapGridHeigth + b);
                for(let i = 1; i < p.length; i++){
                  this.graphics.lineTo(path[i].x * this.mapGridWidth+ b, path[i].y* this.mapGridHeigth + b);
                }
                this.graphics.stroke();
            }
        }
    }
    renderTile(tile: TileBase) {
        this.graphics.rect(tile.posX * this.mapGridWidth, tile.posY * this.mapGridHeigth, tile.tileWidth, tile.tileHeight);
        this.graphics.fillColor = tile.tileColor;
        this.graphics.fill();
    }
}
