export function LcLog(...val){
    cc.log("liuchen",val);
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