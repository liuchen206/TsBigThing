import MapIsometric from "./MapIsometric";
import { MakeXYToKey } from "./Tools";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
export enum movingDir{
    xAxis = 0,
    yAxis,
    xyAxis,
};
@ccclass
export default class tileFloor extends cc.Component {
    xMapIndex:number = 0;
    yMapIndex:number = 0;
    mapFloor:number = 0;
    movingDir:movingDir = movingDir.xAxis;
    walkAbleTileIndexList:Array<cc.Vec2> = [];

    @property(cc.Label)
    someInfo:cc.Label;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStartCallback, this, true); 
    }

    start () {

    }

    // update (dt) {}

    onTouchStartCallback(event){
        cc.log("onTouchStartCallback pos",event.getLocation().toString(),"xIndex",this.xMapIndex,"yIndex",this.yMapIndex,"mapFloor",this.mapFloor);
        if(this.mapFloor == 2){
            (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).resetSelect();
            (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).currentSelectedTile = this.node;
            this.lightUpSelect();
            this.calculateWalkableTile();
        }
        if(this.mapFloor == 1){
            if((cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).currentSelectedTile != null){
                let movingNode = (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).currentSelectedTile;
                (movingNode.getComponent("tileFloor") as tileFloor).moveTo(new cc.Vec2(this.xMapIndex,this.yMapIndex));
            }
        }
    }
    moveTo(pos:cc.Vec2){
        this.walkAbleTileIndexList.forEach(element => {
            if(element.x == pos.x && element.y == pos.y){
                let convertedPos = (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).convertIndexToPostion(pos.x,pos.y);
                let moveto = cc.moveTo(0.2,convertedPos);
                this.node.runAction(moveto);
        
                (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).tilesMapSecond.delete(MakeXYToKey(this.xMapIndex,this.yMapIndex));
                (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).tilesMapSecond.set(MakeXYToKey(pos.x,pos.y),this.node);
                this.xMapIndex = pos.x;
                this.yMapIndex = pos.y;
            }
        });
    }
    calculateWalkableTile(){
        this.walkAbleTileIndexList = [];
        
        let firstFloorTilesList = (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).tilesMapFirst;
        let mapLengthX = (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).mapLengthX;
        let mapLengthY = (cc.find("Canvas/MapIsometric").getComponent("MapIsometric") as MapIsometric).mapLengthY;
        if(this.movingDir == movingDir.xAxis){
            for(var i = 0; i < mapLengthX ; i++){
                if(i == this.xMapIndex){
                    continue;
                }
                let targetCheckIndex = new cc.Vec2(i,this.yMapIndex);
                let tileNode = firstFloorTilesList.get(MakeXYToKey(targetCheckIndex.x,targetCheckIndex.y));
                if(tileNode){
                    (tileNode.getComponent("tileFloor") as tileFloor).lightUpBlink();
                    this.walkAbleTileIndexList.push(targetCheckIndex);
                }
            }
        }
    }
    lightUpSelect(){
        this.node.color = cc.Color.BLACK;
    }
    lightUpBlink(){
        this.node.color = cc.Color.RED;
    }
    lightDown(){
        this.node.color = cc.Color.WHITE;
    }

    setInof(text:string){
        this.someInfo.string = text;
    }
}
