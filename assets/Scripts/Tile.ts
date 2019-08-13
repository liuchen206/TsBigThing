import { TileType } from "./ConstantsDefine";

const {ccclass, property} = cc._decorator;

export class UnitBase implements appearance{
    render(graphics: cc.Graphics): void {
        throw new Error("Method not implemented.");
    }
    tileWidth:number;
    tileHeight:number;
    posX:number;
    posY:number;

    Dragable:boolean;
    Walkable:boolean;
    Deleteable:boolean;

    id:number;
    name:string;

    constructor(id:number,name:string, width:number,height:number,posX:number,posY:number,type:TileType){
        this.id = id;
        this.name = name;
        this.tileWidth = width;
        this.tileHeight = height;
        this.posX = posX;
        this.posY = posY;
        if(type == TileType.test){
            this.Dragable = true;
            this.Walkable = true;
            this.Deleteable = false;
        }else if(type == TileType.obstruct){
            this.Dragable = false;
            this.Walkable = false;
            this.Deleteable = true;
        }
    }
}

export class UnitColor extends UnitBase{
    render(graphics: cc.Graphics): void {
        graphics.circle(this.posX * this.tileWidth +this.tileWidth/2, this.posY * this.tileHeight+this.tileHeight/2, this.tileWidth/2);
        // graphics.rect(this.posX * this.tileWidth, this.posY * this.tileHeight, this.tileWidth, this.tileHeight);
        graphics.fillColor = this.tileColor;
        graphics.fill();
    }
    tileColor:cc.Color;
    constructor(id:number,name:string, width:number,height:number,posX:number,posY:number,type:TileType,tileColor:cc.Color){
        super(id,name,width,height,posX,posY,type);
        this.tileColor = tileColor;
    }
}

interface appearance{
    render(graphics:cc.Graphics):void
}


