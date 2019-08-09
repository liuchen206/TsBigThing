import { TileBase } from "./Tile";
import { TileType, OperateTileType } from "./ConstantsDefine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class mapTS extends cc.Component {

    graphics: cc.Graphics;
    mapGridWidth:number = 20; // 地图中单元网格宽
    mapGridHeigth:number = 20; // 地图中单元网格高
    mapWidth:number; // 地图总宽
    mapHeight:number; // 地图总长
    mapStartPosX:number; // 地图绘制起点x
    mapStartPosY:number; // 地图绘制起点y
    pathObj:object;
    startTile:TileBase; // 寻路测试起点
    endTile:TileBase; // 寻路测试终点
    bgTile:TileBase; // 地图背景
    inputOperateType:OperateTileType; // 用户输入后，执行的操作类型
    selectedTile:TileBase;

    _tileNumX:number;
    _tileNumY:number;
    get tileNumX () {
        this._tileNumX = Math.ceil(this.mapWidth/this.mapGridWidth);
        return this._tileNumX;
    }
    get tileNumY () {
        this._tileNumY = Math.ceil(this.mapHeight/this.mapGridHeigth);
        return this._tileNumY;
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.init();
        this.graphics = this.node.addComponent(cc.Graphics);
        this.renderMap();
    }

    // update (dt) {}
    init(){
        this.inputOperateType = OperateTileType.None;
        this.mapWidth = cc.view.getVisibleSize().width;
        this.mapHeight = cc.view.getVisibleSize().height;
        this.mapStartPosX = cc.view.getVisibleOrigin().x;
        this.mapStartPosY = cc.view.getVisibleOrigin().y;
        this.startTile=new TileBase(this.mapGridWidth,this.mapGridHeigth,5,10,cc.color(0, 255, 100),TileType.testType);
        this.endTile=new TileBase(this.mapGridWidth,this.mapGridHeigth,10,10,cc.color(255,0,0),TileType.testType);
        this.bgTile=new TileBase(this.mapWidth,this.mapHeight,this.mapStartPosX,this.mapStartPosY,cc.color(255, 255, 255),TileType.default);
        this.pathObj = {}; 
        this.pathObj[5+"*"+10] = this.startTile;
        this.pathObj[10+"*"+10] = this.endTile;
        cc.Canvas.instance.node.on("mousedown",this.OnMouseDown,this);
    }
    OnMouseDown(e:cc.Touch){
        let nx = Math.floor(e.getLocationX() / this.mapGridWidth);
        let ny =Math.floor(e.getLocationY() / this.mapGridHeigth);
        cc.log('OnMouseDown',nx,ny);
        if(this.pathObj[nx+"*"+ny] != null){
            this.selectedTile = this.pathObj[nx+"*"+ny];
            if(this.selectedTile.Dragable == true){
                this.inputOperateType = OperateTileType.Move;
            }
        }else{
            this.inputOperateType = OperateTileType.Add;
        }
        cc.Canvas.instance.node.on("mouseup",this.OnMouseUp,this);
        cc.Canvas.instance.node.on("mousemove",this.OnMouseMove,this);
    }
    OnMouseUp(e:cc.Touch){
        cc.Canvas.instance.node.off("mouseup",this.OnMouseUp,this);
        cc.Canvas.instance.node.off("mousemove",this.OnMouseMove,this);
        this.inputOperateType = OperateTileType.None;
    }    
    OnMouseMove(e:cc.Touch){
        let nx = Math.floor(e.getLocationX() / this.mapGridWidth);
        let ny =Math.floor(e.getLocationY() / this.mapGridHeigth);
        if(this.inputOperateType == OperateTileType.Move){
            if(this.pathObj[nx+"*"+ny] == null){
                if(this.selectedTile.posX != nx || this.selectedTile.posY != ny){
                    this.pathObj[this.selectedTile.posX+"*"+this.selectedTile.posY] = null;
                    this.selectedTile.posX = nx;
                    this.selectedTile.posY = ny;
                    this.pathObj[nx+"*"+ny] = this.selectedTile;
                    this.renderMap();
                }
            }
        }
    }
    renderMap(){
        this.graphics.clear();
        this.renderTile(this.bgTile);
        for (let y = this.mapStartPosY; y < this.tileNumY; y++){
            for (let x = this.mapStartPosX; x < this.tileNumX; x++){
                if (this.pathObj[x+"*"+y] != null){
                    this.renderTile(this.pathObj[x+"*"+y]);
                }
                this.graphics.strokeColor = cc.color(150,150,150);
                this.graphics.rect(this.mapGridWidth * x , this.mapGridHeigth * y , this.mapGridWidth, this.mapGridHeigth);
                this.graphics.stroke();
            }
        }
    }
    renderTile(tile:TileBase){
        this.graphics.rect(tile.posX*this.mapGridWidth,tile.posY*this.mapGridHeigth,tile.tileWidth,tile.tileHeight);
        this.graphics.fillColor =tile.tileColor;
        this.graphics.fill();
    }
}
