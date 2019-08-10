import { TileType } from "./ConstantsDefine";
const {ccclass, property} = cc._decorator;

export class TileBase {
    tileWidth:number;
    tileHeight:number;
    posX:number;
    posY:number;
    tileColor:cc.Color;
    _tileType:TileType;

    Dragable:boolean;
    Walkable:boolean;
    Deleteable:boolean;

    set tileType (value) {
        if(value == TileType.default){
            this.Dragable = false;
            this.Walkable = false;
            this.Deleteable = false;
        }
        if(value == TileType.testType){
            this.Dragable = true;
            this.Walkable = true;
            this.Deleteable = true;
        }
        if(value == TileType.obstruct){
            this.Dragable = false;
            this.Walkable = false;
            this.Deleteable = true;
        }
        this._tileType = value;
    }
    constructor(width:number,height:number,posX:number,posY:number,tileColor:cc.Color,tileType:TileType){
        this.tileWidth = width;
        this.tileHeight = height;
        this.posX = posX;
        this.posY = posY;
        this.tileColor = tileColor;
        this.tileType = tileType;
    }
}
