import { LcLog } from "./Tools";

const {ccclass, property} = cc._decorator;


class unit implements move,happy{
    walkSpeed: number;
    playGame(): void {
        LcLog("play game");
    }
    walk(): void {
        LcLog("walk slow");
    }
    id:number;
    name:string;
    constructor(id:number,name:string){
        this.id = id;
        this.name = name;
    }
    printInfo(){
        LcLog("id",this.id);
        LcLog("name",this.name);
    }
}

class unitLiuchen extends unit implements move,happy{
    // playGame(): void {
    //     LcLog("diff play game");
    // }
    // walk(): void {
    //     LcLog("diff walk slow");
    // }
    constructor(id:number,name:string){
        super(id,name);
    }
    printInfo(){
        LcLog("say diff id",this.id);
        LcLog("say diff name",this.name);
    }
}

interface move{
    walkSpeed:number;
    walk():void;
}
interface happy{
    playGame():void
}

@ccclass
export default class objectProgram extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let liuchen = new unitLiuchen(1,"liuchen");
        liuchen.printInfo();
        liuchen.playGame();
        liuchen.walk();
    }

    // update (dt) {}
}
