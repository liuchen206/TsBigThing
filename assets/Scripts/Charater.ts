import { LcLog } from "./Tools";

const {ccclass, property} = cc._decorator;

export enum FacingDirection
{
    Up = 0,
    UpRight,
    Right,
    RightDown,
    Down,
    DownLeft,
    Left,
    LeftUp,
    Max,
}

@ccclass
export default class Charater extends cc.Component {

    @property(cc.SpriteFrame)
    charaterDown:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterUp:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterRight:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterLeft:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterRightDown:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterDownLeft:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterLeftUp:cc.SpriteFrame;
    @property(cc.SpriteFrame)
    charaterUpRight:cc.SpriteFrame;
    @property(cc.Sprite)
    charaterSprite:cc.Sprite;

    currentFacingDirect:FacingDirection;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initSelf();
    }

    // update (dt) {}

    initSelf(){
        this.setFacingDiction(FacingDirection.Down);
    }
    changeFacingDiction(){
        let newFacingDic = this.currentFacingDirect+1;
        if(newFacingDic >= FacingDirection.Max){
            newFacingDic = 0;
        }
        LcLog("@@@@+",newFacingDic);
        this.setFacingDiction(newFacingDic);
    }
    Jump(){
        let forceUp = 450;
        let forceForward = 450;
        let dicUp = new cc.Vec2(0,1);
        let dicForward = new cc.Vec2(0,0);
        if(this.currentFacingDirect == FacingDirection.Down){
            dicForward.y = -1;
            dicForward.x = -1;
        }
        let body = this.node.getComponent(cc.RigidBody);
        // body.applyLinearImpulse(dicUp.normalize().mul(forceUp),body.getWorldCenter(),true);
        // body.applyLinearImpulse(dicUp.normalize().mul(forceUp),body.getWorldCenter(),true);
        body.applyLinearImpulse(dicForward.normalize().mul(forceForward),body.getWorldCenter(),true);
    }
    setFacingDiction(newDic:FacingDirection){
        if(newDic != this.currentFacingDirect){
            this.currentFacingDirect = newDic;
            if(this.currentFacingDirect == FacingDirection.Down){
                this.charaterSprite.spriteFrame = this.charaterDown;
            }
            if(this.currentFacingDirect == FacingDirection.DownLeft){
                this.charaterSprite.spriteFrame = this.charaterDownLeft;
            }
            if(this.currentFacingDirect == FacingDirection.Left){
                this.charaterSprite.spriteFrame = this.charaterLeft;
            }
            if(this.currentFacingDirect == FacingDirection.LeftUp){
                this.charaterSprite.spriteFrame = this.charaterLeftUp;
            }
            if(this.currentFacingDirect == FacingDirection.Right){
                this.charaterSprite.spriteFrame = this.charaterRight;
            }
            if(this.currentFacingDirect == FacingDirection.RightDown){
                this.charaterSprite.spriteFrame = this.charaterRightDown;
            }
            if(this.currentFacingDirect == FacingDirection.Up){
                this.charaterSprite.spriteFrame = this.charaterUp;
            }
            if(this.currentFacingDirect == FacingDirection.UpRight){
                this.charaterSprite.spriteFrame = this.charaterUpRight;
            }
        }
    }
}
