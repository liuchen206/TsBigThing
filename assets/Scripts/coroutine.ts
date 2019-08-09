const {ccclass, property} = cc._decorator;

@ccclass
export default class coroutine extends cc.Component {
    [x: string]: any;

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Label)
    tips:cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.AddTo(0,100);
        this.tips.string = "测试开始";
    }

    // update (dt) {}

    sleep(wait:number){
        return new Promise((res,rej)=>{
            setTimeout(function() {
                cc.log("???")
                res(); 
            }, wait);
        })
    }
    async AddTo(start:number,end:number){
        this.label.string = start+"";
        for(let i = start;i <= end ;i++){
            cc.log("!!!")
            await this.sleep(0.3);
            this.label.string = i+"";
        }
    }

    async hunt(){
        await this.SearchMouse();
        await this.CatchMouse();
        await this.EatMouse();
    }
}
