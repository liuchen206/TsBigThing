import { TileBase } from "./Tile";
import { TileType, OperateTileType } from "./ConstantsDefine";

const { ccclass, property } = cc._decorator;

class SearchNode {
    version: boolean = false;
    x: number = 0;
    y: number = 0;
    links: Array<TileBase>;
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
    addLinks(obj: object, mapObj: object) {
        this.links = [];
        if (this.x > 0) {
            this.addL((this.x - 1), this.y, obj, mapObj);
        }
        if (this.y > 0) {
            this.addL(this.x, (this.y - 1), obj, mapObj);
        }
        this.addL((this.x + 1), this.y, obj, mapObj);
        this.addL(this.x, (this.y + 1), obj, mapObj);
    }
    addL(tx: number, ty: number, obj: object, mapObj: object) {
        let id = ty + "*" + tx;
        if (mapObj[id] == null) {
            if (obj[id] == null) {
                obj[id] = new SearchNode(tx, ty);
                this.links.push(obj[id]);
                this.linksLength++;
            }
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
    mapArr: object;
    findMax: 5000;

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
        this.endTile = new TileBase(this.mapGridWidth, this.mapGridHeigth, 10, 10, cc.color(255, 0, 0), TileType.testType);
        this.bgTile = new TileBase(this.mapWidth, this.mapHeight, this.mapStartPosX, this.mapStartPosY, cc.color(255, 255, 255), TileType.default);
        this.pathObj = {};
        this.mapArr = {};
        this.pathObj[5 + "*" + 10] = this.startTile;
        this.pathObj[10 + "*" + 10] = this.endTile;
        cc.Canvas.instance.node.on("mousedown", this.OnMouseDown, this);
    }
    searchPath(startX: number, startY: number, endX: number, endY: number): Array<cc.Vec2> {
        var path = new Array<cc.Vec2>();
        this.mapArr = {};
        let startNode = new SearchNode(startX, startY);
        let endNode = new SearchNode(endX, endY);
        let i, l, f, t, current, test, links;
        let openBase = Math.abs(startX - endX) + Math.abs(startY - endY);
        let open = [null, null];
        open[0] = startNode;
        startNode.version = true;
        startNode.nowCost = 0;
        let js = 0;
        while (true) {
            js++;
            if (js >= this.findMax) {
                //超出上限代表没找到
                return new Array<cc.Vec2>();
            }
            current = open[0];
            open[0] = current.next;
            if (open[0] != null) open[0].pre = null;
            if (current.x == endNode.x && current.y == endNode.y) {
                path = this.prunePath(startNode, current, path);
                return path;
            }
            if (current.links == null) {
                current.addLinks(this.mapArr, this.pathObj);
            }
            links = current.links;
            l = current.linksLength;
            for (i = 0; i < l; i++) {
                test = links[i];//测试的四个面
                f = current.nowCost + 1;
                if (!test.version) {
                    test.version = true;
                    test.parent = current;
                    test.nowCost = f;
                    test.dist = Math.abs(endX - test.x) + Math.abs(endY - test.y);//到终点的距离
                    f += test.dist;
                    test.mayCost = f;//估计的消耗	
                    f = (f - openBase) >> 1;
                    test.pre = null;
                    test.next = open[f];//保存下一步
                    if (open[f] != null) open[f].pre = test;
                    open[f] = test;
                } else {
                    if (test.pre != null) test.pre.next = test.next;
                    if (test.next != null) test.next.pre = test.pre;
                    if (open[1] == test) open[1] = test.next;

                    test.parent = current;
                    test.nowCost = f;
                    test.mayCost = f + test.dist;//加下终点绝对值
                    test.pre = null;
                    test.next = open[0];
                    if (open[0] != null) open[0].pre = test;
                    open[0] = test;
                }
            }
            if (open[0] == null) {
                if (open[1] == null) {

                    break;
                }
                t = open[0];
                open[0] = open[1];
                open[1] = t;
                openBase += 2;
            }
        }
        return [];
    }
    prunePath(startNode: SearchNode, endNode: SearchNode, path: Array<cc.Vec2>) {
        let current = endNode;
        let dx = current.x - endNode.x;
        let dy = current.y - endNode.y;
        let cx, cy, t, t2;

        while (true) {
            if (current.x == startNode.x && current.y == startNode.y) {
                path.push(cc.v2(current.x, current.y));
                return path;
            }
            t = current.parent;
            cx = current.x;
            cy = current.y;
            if (t != startNode) {
                t2 = t.parent;
                if (Math.abs(t2.x - cx) == 1 && Math.abs(t2.y - cy) == 1 && this.pathObj[cy + "*" + t2.x] == null && this.pathObj[t2.y + "*" + cx] == null) {
                    t = t2;
                }
            }
            if (t.x - cx == dx && t.y - cy == dy) {
                current = t;
            } else {
                dx = t.x - cx;
                dy = t.y - cy;
                path.push(cc.v2(current.x, current.y));
                current = t;
            }
        }
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

        // let path = this.searchPath(this.startTile.posX,this.startTile.posY,this.endTile.posX,this.endTile.posY);
        // if (path != null){
        //     if (path.length > 1){
        //         let b = this.mapGridWidth / 2;
        //         let p = new Array(path.length);
        //         this.graphics.strokeColor = cc.Color.BLUE;
        //         this.graphics.moveTo(path[0].x * this.mapGridWidth+ b, path[0].y * this.mapGridHeigth + b);
        //         for(let i = 1; i < p.length; i++){
        //           this.graphics.lineTo(path[i].x * this.mapGridWidth+ b, path[i].y* this.mapGridHeigth + b);
        //         }
        //         this.graphics.stroke();
        //     }
        // }
    }
    renderTile(tile: TileBase) {
        this.graphics.rect(tile.posX * this.mapGridWidth, tile.posY * this.mapGridHeigth, tile.tileWidth, tile.tileHeight);
        this.graphics.fillColor = tile.tileColor;
        this.graphics.fill();
    }
}
