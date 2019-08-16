export function LcLog(...val){
    cc.log("lc",val);
}

export class UnitIdCreator{
    private idCanUsed:number = 0;
    private static _instance:UnitIdCreator;
    public static getInstance():UnitIdCreator{
         if(this._instance == null){
          this._instance = new UnitIdCreator();
      }
      return this._instance;
   }
   getNewID():number{
        return this.idCanUsed++;
   }
}

export function LcFract(num:number){
    let intPart = Math.floor(num);
    return num -= intPart;
}

export function MapNum(targetNum:number,srcStart:number,srcEnd:number,targetStart:number,targetEnd:number):number{
    var srcArea = srcEnd - srcStart;
    var targetArea = targetEnd - targetStart;
    var targetOffset = targetNum - srcStart;
    return targetStart+targetOffset/srcArea*targetArea;
};