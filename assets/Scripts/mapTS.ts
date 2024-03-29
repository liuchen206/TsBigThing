import { UnitBase, UnitColor } from "./Tile";
import { TileType, OperateTileType } from "./ConstantsDefine";
import { SearchParameters, AstarPathFinding } from "./AstarPathFinding";
import { UnitIdCreator } from "./Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class mapTS extends cc.Component {

    graphics: cc.Graphics;
    mapGridWidth: number = 20; // 地图中单元网格宽
    mapGridHeigth: number = 20; // 地图中单元网格高
    mapWidth: number; // 地图总宽
    mapHeight: number; // 地图总长
    mapStartPosX: number; // 地图绘制起点x
    mapStartPosY: number; // 地图绘制起点y
    pathObj: Map<string,UnitBase>;
    startTile: UnitBase; // 寻路测试起点
    endTile: UnitBase; // 寻路测试终点
    inputOperateType: OperateTileType; // 用户输入后，执行的操作类型
    selectedTile: UnitBase;

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
        this.startTile = new UnitColor(UnitIdCreator.getInstance().getNewID(),"startTile",this.mapGridWidth, this.mapGridHeigth, 5, 10,TileType.test ,cc.color(0, 255, 100));
        this.endTile = new UnitColor(UnitIdCreator.getInstance().getNewID(),"endTile",this.mapGridWidth, this.mapGridHeigth, 8, 11, TileType.test, cc.color(255, 0, 0));
        this.pathObj = new Map();
        this.pathObj.set(this.startTile.posX + "*" + this.startTile.posY,this.startTile);
        this.pathObj.set(this.endTile.posX + "*" + this.endTile.posY,this.endTile);
        cc.Canvas.instance.node.on("mousedown", this.OnMouseDown, this);
    }
    OnMouseDown(e: cc.Touch) {
        let nx = Math.floor(e.getLocationX() / this.mapGridWidth);
        let ny = Math.floor(e.getLocationY() / this.mapGridHeigth);
        cc.log('OnMouseDown', nx, ny);
        if (this.pathObj.has(nx + "*" + ny)) {
            this.selectedTile = this.pathObj.get(nx + "*" + ny);
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
            if (this.pathObj.has(nx + "*" + ny) == false) {
                if (this.selectedTile.posX != nx || this.selectedTile.posY != ny) {
                    this.pathObj.delete(this.selectedTile.posX + "*" + this.selectedTile.posY);
                    this.selectedTile.posX = nx;
                    this.selectedTile.posY = ny;
                    this.pathObj.set(nx + "*" + ny,this.selectedTile);
                    this.renderMap();
                }
            }
        }
        if (this.inputOperateType == OperateTileType.Add) {
            if (this.pathObj.has(nx + "*" + ny) == false) {
                this.pathObj.set(nx + "*" + ny,new UnitColor(UnitIdCreator.getInstance().getNewID(),"obstruct",this.mapGridWidth, this.mapGridHeigth, nx, ny,TileType.obstruct, cc.color(150, 150, 150)));
                this.renderMap();
            } else {
                if (this.pathObj.get(nx + "*" + ny).Deleteable == true) {
                    this.pathObj.set(nx + "*" + ny,new UnitColor(UnitIdCreator.getInstance().getNewID(),"obstruct",this.mapGridWidth, this.mapGridHeigth, nx, ny,TileType.obstruct, cc.color(150, 150, 150)));
                    this.renderMap();
                }
            }
        }
        if (this.inputOperateType == OperateTileType.Delete) {
            if (this.pathObj.has(nx + "*" + ny) == false) {

            } else {
                if (this.pathObj.get(nx + "*" + ny).Deleteable == true) {
                    this.pathObj.delete(nx + "*" + ny);
                    this.renderMap();
                }
            }
        }

    }
    renderMap() {
        this.graphics.clear();
        this.drawBG(this.mapStartPosX, this.mapStartPosY, this.mapWidth, this.mapHeight, cc.color(255, 255, 255));
        for (let y = this.mapStartPosY; y < this.tileNumY; y++) {
            for (let x = this.mapStartPosX; x < this.tileNumX; x++) {
                if (this.pathObj.has(x + "*" + y)) {
                    this.pathObj.get(x + "*" + y).render(this.graphics)
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
    drawBG(posX:number,posY:number,tileWidth:number,tileHeight:number,tileColor:cc.Color){
        // this.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        // this.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        // this.graphics.lineWidth = 10;
        this.graphics.rect(posX * this.mapGridWidth, posY * this.mapGridHeigth, tileWidth, tileHeight);
        this.graphics.fillColor = tileColor;
        this.graphics.fill();
    }
}
