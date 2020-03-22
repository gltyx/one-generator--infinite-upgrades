/*(function (globalScope){ //Caching ExpantaNum
  var oldExpantaNum=globalScope.ExpantaNum;
  var ExpantaNumCache=[];
  var ExpantaNum=function cachingExpantaNum(input){
    if (!(this instanceof ExpantaNum)) return new ExpantaNum();
    for (var i=0;i<ExpantaNumCache.length;i++){
      if (Object.is?Object.is(ExpantaNumCache[i][0],input):ExpantaNumCache[i][0]===input){
        return ExpantaNumCache[i][1];
      }
    }
    var r=new oldExpantaNum();
    ExpantaNumCache.push([input,r]);
    return r;
  }
  for (var i in oldExpantaNum){
    if (oldExpantaNum.hasOwnProperty(i)) ExpantaNum[i]=oldExpantaNum[i];
  }
  globalScope.ExpantaNum=ExpantaNum;
})(this);*/
(function (globalScope){//Custom constants
  globalScope.ExpantaNum.TWO=ExpantaNum(2);
})(this);
function dg(s){
  return document.getElementById(s);
}
var onclicks={};
var game={
  currency:ExpantaNum.ZERO.clone(),
  generators:ExpantaNum.ZERO.clone(),
  upgrades:{
    strongerGenerators:ExpantaNum.ZERO.clone(),
    strongerGenerators2:ExpantaNum.ZERO.clone(),
    strongerGenerators3:ExpantaNum.ZERO.clone(),
    strongerGenerators4:ExpantaNum.ZERO.clone(),
    cheaperUpgrades:ExpantaNum.ZERO.clone(),
    strongerGenerators5:ExpantaNum.ZERO.clone(),
    strongerGenerators6:ExpantaNum.ZERO.clone(),
    autoBuy:ExpantaNum.ZERO.clone(),
    strongerGenerators7:ExpantaNum.ZERO.clone(),
    cheaperUpgrades2:ExpantaNum.ZERO.clone(),
    strongerGenerators8:ExpantaNum.ZERO.clone(),
    strongerGenerators9:ExpantaNum.ZERO.clone(),
    strongerGenerators10:ExpantaNum.ZERO.clone(),
    cheaperUpgrades3:ExpantaNum.ZERO.clone(),
    strongerGenerators11:ExpantaNum.ZERO.clone()
  },
  lasttime:new Date().getTime(),
  offlinetime:0,
  debug:{
    timescale:1
  }
};
var framesInLastSecond=[];
var offlineBoost;
function loop(){
  var time=new Date().getTime();
  var dt=(time-game.lasttime)*game.debug.timescale;
  if (game.offlinetime>0){
    var speed;
    if (game.offlinetime>offlineBoost.total/2) speed=Math.max((offlineBoost.total-game.offlinetime)/2048+1,1.1);
    else speed=Math.max(game.offlinetime/2048+1,1.1);
    if (dt+game.offlinetime>dt*speed){
      game.offlinetime-=Math.ceil(dt*(speed-1));
      dt=Math.ceil(dt*speed);
    }else{
      dt=dt+game.offlinetime;
      game.offlinetime=0;
    }
    offlineBoost.speed=speed;
  }
  game.currency=game.currency.add(getCurrencyPerSecond().times(dt/1000));
  removeMaxUpgradeAmountCache();
  autoBuy();
  updateDisplay();
  game.lasttime=time;
}
var cache={
  upgradeCostFactor:{},
  upgradeCost:{},
  maxUpgradeAmount:{},
  maxUpgradeCost:{}
};
var upgradesList=[];
(function (){
  for (var key in game.upgrades){
    if (game.upgrades.hasOwnProperty(key)){
      upgradesList.push(key);
    }
  }
})();
function removeUpgradeCostFactorCache(names){
  if (typeof names=="undefined") names=upgradesList;
  for (var i=0;i<names.length;i++){
    var name=names[i];
    cache.upgradeCostFactor[name]=null;
    cache.upgradeCost[name]=null;
    cache.maxUpgradeAmount[name]=null;
    cache.maxUpgradeCost[name]=null;
  }
}
function removeUpgradeCostCache(names){
  if (typeof names=="undefined") names=upgradesList;
  for (var i=0;i<names.length;i++){
    var name=names[i];
    cache.upgradeCost[name]=null;
    cache.maxUpgradeAmount[name]=null;
    cache.maxUpgradeCost[name]=null;
  }
}
function removeMaxUpgradeAmountCache(names){
  if (typeof names=="undefined") names=upgradesList;
  for (var i=0;i<names.length;i++){
    var name=names[i];
    cache.maxUpgradeAmount[name]=null;
    cache.maxUpgradeCost[name]=null;
  }
}
function removeMaxUpgradeCostCache(names){
  if (typeof names=="undefined") names=upgradesList;
  for (var i=0;i<names.length;i++){
    var name=names[i];
    cache.maxUpgradeCost[name]=null;
  }
}
function getCurrencyPerSecond(){
  var r=game.generators;
  r=r.mul(ExpantaNum.pow(1.1,game.upgrades.strongerGenerators));
  r=r.mul(ExpantaNum.pow(1.15,game.upgrades.strongerGenerators2));
  r=r.mul(ExpantaNum.pow(1.3,game.upgrades.strongerGenerators3.mul(ExpantaNum.pow(1.07,game.upgrades.strongerGenerators5))));
  r=r.mul(ExpantaNum.pow(1.05,game.upgrades.strongerGenerators3.mul(game.upgrades.strongerGenerators4)));
  r=r.mul(ExpantaNum.pow(1.4,game.upgrades.strongerGenerators6.mul(ExpantaNum.pow(1.17,game.upgrades.strongerGenerators10))));
  r=r.mul(ExpantaNum.pow(1.1,game.upgrades.strongerGenerators7.mul(ExpantaNum.pow(1.25,game.upgrades.strongerGenerators8))).pow(2));
  if (game.upgrades.strongerGenerators11.gte(ExpantaNum.ONE)){
    r=r.mul(ExpantaNum.pow(2.5,game.upgrades.strongerGenerators9.mul(ExpantaNum.pow(1.17,game.upgrades.strongerGenerators10))));
  }else{
    r=r.mul(ExpantaNum.pow(2.5,game.upgrades.strongerGenerators9));
  }
  return r;
}
function getGeneratorCost(){
  if (game.generators.eq(ExpantaNum.ZERO)) return ExpantaNum.ZERO.clone();
  else return ExpantaNum.POSITIVE_INFINITY.clone();
}
function canBuyGenerator(){
  return game.currency.gte(getGeneratorCost());
}
function buyGenerator(){
  if (canBuyGenerator()){
    game.currency=game.currency.sub(getGeneratorCost());
    game.generators=game.generators.add(ExpantaNum.ONE);
  }
}
function getUpgradeCostFactor(name){
  if (cache.upgradeCostFactor[name]) return cache.upgradeCostFactor[name];
  var returnValue;
  if (name=="strongerGenerators"){
    returnValue={
      type:"exponential",
      base:ExpantaNum(1/4),
      exponent:ExpantaNum.TWO.clone()
    };
  }else if (name=="strongerGenerators2"){
    returnValue={
      type:"exponential",
      base:ExpantaNum(70),
      exponent:ExpantaNum(3)
    };
  }else if (name=="strongerGenerators3"){
    returnValue={
      type:"doubleGeometric",
      base:ExpantaNum(150),
      exponent:{
        base:ExpantaNum(1.5),
        exponent:ExpantaNum(1.2)
      }
    };
  }else if (name=="strongerGenerators4"){
    returnValue={
      type:"doubleGeometric",
      base:ExpantaNum(400),
      exponent:{
        base:ExpantaNum(1.7),
        exponent:ExpantaNum(1.3)
      }
    };
  }else if (name=="cheaperUpgrades"){
    returnValue={
      type:"doubleGeometric",
      base:ExpantaNum(2000),
      exponent:{
        base:ExpantaNum(1.05),
        exponent:ExpantaNum(1.05)
      }
    };
  }else if (name=="strongerGenerators5"){
    returnValue={
      type:"doubleExponential",
      base:ExpantaNum(1000/27),
      exponent:{
        base:ExpantaNum(81),
        exponent:ExpantaNum(1.2)
      }
    };
  }else if (name=="strongerGenerators6"){
    returnValue={
      type:"doubleExponential",
      base:ExpantaNum(10000),
      exponent:{
        base:ExpantaNum(64),
        exponent:ExpantaNum(1.4)
      }
    };
  }else if (name=="autoBuy"){
    returnValue={
      type:"once",
      cost:ExpantaNum(6e7)
    }
  }else if (name=="strongerGenerators7"){
    returnValue={
      type:"doubleExponential",
      base:ExpantaNum(5e39),
      exponent:{
        base:ExpantaNum.TWO.clone(),
        exponent:ExpantaNum.TWO.clone()
      }
    };
  }else if (name=="cheaperUpgrades2"){
    returnValue={
      type:"doubleExponential",
      base:ExpantaNum(8e84),
      exponent:{
        base:ExpantaNum(1.25),
        exponent:ExpantaNum(2.1)
      }
    };
  }else if (name=="strongerGenerators8"){
    returnValue={
      type:"doubleExponentiatedPolynomial",
      base:ExpantaNum(1e84),
      exponent:{
        base:ExpantaNum(10),
        exponent:{
          base:ExpantaNum.TWO.clone(),
          power:ExpantaNum(1.1)
        }
      }
    };
  }else if (name=="strongerGenerators9"){
    returnValue={
      type:"doubleExponentiatedPolynomial",
      base:ExpantaNum(5e83),
      exponent:{
        base:ExpantaNum(20),
        exponent:{
          base:ExpantaNum(1.75),
          power:ExpantaNum(1.15)
        }
      }
    };
  }else if (name=="strongerGenerators10"){
    returnValue={
      type:"doubleExponentiatedPolynomial",
      base:ExpantaNum(2e84),
      exponent:{
        base:ExpantaNum(5),
        exponent:{
          base:ExpantaNum(1.45),
          power:ExpantaNum(1.17)
        }
      }
    };
  }else if (name=="cheaperUpgrades3"){
    returnValue={
      type:"doubleExponentiatedPolynomial",
      base:ExpantaNum(2e89/9),
      exponent:{
        base:ExpantaNum(4),
        exponent:{
          base:ExpantaNum(1.45),
          power:ExpantaNum(1.2)
        }
      }
    };
  }else if (name=="strongerGenerators11"){
    returnValue={
      type:"once",
      cost:ExpantaNum("1e355")
    };
  }
  cache.upgradeCostFactor[name]=returnValue;
  return returnValue;
}
function getUpgradeCost(name,offset,noreduction){
  var saveCache=typeof offset!="undefined"&&!noreduction;
  if (saveCache&&cache.upgradeCost[name]) return cache.upgradeCost[name];
  if (typeof offset=="undefined") offset=ExpantaNum.ZERO.clone();
  if (typeof noreduction=="undefined") noreduction=[];
  var factors=getUpgradeCostFactor(name);
  var num=game.upgrades[name].add(offset);
  var returnValue;
  if (name=="strongerGenerators7"&&!noreduction.includes("cheaperUpgrades2")) num=num.div(ExpantaNum.pow(1.1,game.upgrades.cheaperUpgrades2));
  if (factors.type=="exponential"){
    returnValue=factors.base.mul(factors.exponent.pow(num));
  }else if (factors.type=="doubleGeometric"){
    returnValue=factors.base.mul(factors.exponent.base.pow(num)).mul(factors.exponent.exponent.pow(num.times(num.sub(ExpantaNum.ONE)).div(ExpantaNum.TWO)));
  }else if (factors.type=="doubleExponential"){
    returnValue=factors.base.mul(factors.exponent.base.pow(factors.exponent.exponent.pow(num)));
  }else if (factors.type=="doubleExponentiatedPolynomial"){
    returnValue=factors.base.mul(factors.exponent.base.pow(factors.exponent.exponent.base.pow(num.pow(factors.exponent.exponent.power))));
  }else if (factors.type=="once"){
    if (num.eq(ExpantaNum.ZERO)) returnValue=factors.cost;
    else returnValue=ExpantaNum.POSITIVE_INFINITY.clone();
  }else if (factors.type=="list"){
    if (num.lt(factors.list.length)) returnValue=factors.list[num.array[0][1]];
    else returnValue=ExpantaNum.POSITIVE_INFINITY.clone();
  }
  if (["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4"].includes(name)&&!noreduction.includes("cheaperUpgrades")) returnValue=returnValue.div(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades));
  if (["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4","cheaperUpgrades","strongerGenerators5","strongerGenerators6","strongerGenerators7","cheaperUpgrades2","strongerGenerators8","strongerGenerators9","strongerGenerators10"].includes(name)&&!noreduction.includes("cheaperUpgrades3")) returnValue=returnValue.div(ExpantaNum.pow(1.08,game.upgrades.cheaperUpgrades3));
  if (saveCache) cache.upgradeCost=returnValue;
  return returnValue;
}
function getMaxUpgradeAmount(name){
  if (cache.maxUpgradeAmount[name]) return cache.maxUpgradeAmount[name];
  var returnValue;
  if (!canBuyUpgrade(name)){
    returnValue=ExpantaNum.ZERO.clone();
  }else{
    var effectiveCurrency=game.currency;
    if (["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4"].includes(name)) effectiveCurrency=effectiveCurrency.mul(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades));
    if (["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4","cheaperUpgrades","strongerGenerators5","strongerGenerators6","strongerGenerators7","cheaperUpgrades2","strongerGenerators8","strongerGenerators9","strongerGenerators10"].includes(name)) effectiveCurrency=effectiveCurrency.mul(ExpantaNum.pow(1.08,game.upgrades.cheaperUpgrades3));
    var factors=getUpgradeCostFactor(name);
    if (factors.type=="exponential"){
      returnValue=ExpantaNum.affordGeometricSeries(effectiveCurrency,factors.base,factors.exponent,game.upgrades[name]);
    }else if (factors.type=="once"){
      if (effectiveCurrency.gte(getUpgradeCost(name))) return ExpantaNum.ONE.clone();
      else return ExpantaNum.ZERO.clone();
    }else{
      var test;
      var t={};
      if (factors.type=="doubleGeometric"){
        t.x=effectiveCurrency;
        t.b=factors.base;
        t.y=factors.exponent.base;
        t.z=factors.exponent.exponent;
        t.logz=t.z.log();
        t.ly2lz=t.y.log().mul(ExpantaNum.TWO).div(t.logz);
        upperbound=t.x.div(t.b).log().mul(8).div(t.logz).add(t.ly2lz.sub(ExpantaNum.ONE).pow(ExpantaNum.TWO)).sqrt().sub(t.ly2lz).add(ExpantaNum.ONE).div(ExpantaNum.TWO); //https://www.wolframalpha.com/input/?i=x%3Db*y%5Ek*z%5E%28%28k%5E2-k%29%2F2%29+solve+for+k&lang=ja
      }else if (factors.type=="doubleExponential"){
        t.x=effectiveCurrency;
        t.a=factors.base;
        t.b=factors.exponent.base;
        t.c=factors.exponent.exponent;
        upperbound=t.x.div(t.a).log().div(t.b.log()).log().div(t.c.log()); //https://www.wolframalpha.com/input/?i=x%3Da*b%5Ec%5Ek+solve+for+k&lang=ja
      }else if (factors.type=="doubleExponentiatedPolynomial"){
        t.x=effectiveCurrency;
        t.a=factors.base;
        t.b=factors.exponent.base;
        t.c=factors.exponent.exponent.base;
        t.d=factors.exponent.exponent.power;
        upperbound=t.x.div(t.a).log().div(t.b.log()).log().div(t.c.log()).root(t.d); //https://www.wolframalpha.com/input/?i=x%3Da*b%5Ec%5Ek%5Ed+solve+for+k&lang=ja
      }else if (factors.type=="list"){
        upperbound=factors.list.length-game.upgrades[name].array[0][1];
      }
      t=null;
      upperbound=upperbound.ceil();
      if (effectiveCurrency.gte(getMaxUpgradeCost(name,upperbound))) return upperbound;
      var lowerbound=ExpantaNum.ZERO.clone();
      while (true){
        var test=lowerbound.add(upperbound).div(ExpantaNum.TWO).floor();
        if (lowerbound.eq(upperbound)||lowerbound.eq(test)||upperbound.eq(test)){
          returnValue=lowerbound;
          break;
        }
        var sum=getMaxUpgradeCost(name,test);
        var cmp=effectiveCurrency.cmp(sum);
        if (cmp===0){ //eq
          returnValue=test;
          break;
        }else if (cmp==1){ //gt
          lowerbound=test;
        }else if (cmp==-1){ //lt
          upperbound=test;
        }else{ //NaN
          throw Error("Something is NaN--"+name);
        }
      }
    }
  }
  cache.maxUpgradeAmount[name]=returnValue;
  return returnValue;
}
function getMaxUpgradeCost(name,numOverride,noreduction){
  var saveCache=typeof numOverride!="undefined"&&!noreduction;
  if (saveCache&&cache.maxUpgradeCost[name]) cache.maxUpgradeCost[name];
  if (typeof numOverride=="undefined") numOverride=getMaxUpgradeAmount(name);
  if (typeof noreduction=="undefined") noreduction=[];
  var returnValue;
  if (numOverride.eq(ExpantaNum.ZERO)){
    returnValue=ExpantaNum.ZERO.clone();
  }else{
    var factors=getUpgradeCostFactor(name);
    if (factors.type=="exponential"){
      returnValue=ExpantaNum.sumGeometricSeries(numOverride,factors.base,factors.exponent,game.upgrades[name]);
    }else if (factors.type=="once"){
      if (game.upgrades[name].eq(ExpantaNum.ZERO)&&numOverride.eq(ExpantaNum.ONE)) return factors.cost;
      else return ExpantaNum.POSITIVE_INFINITY.clone();
    }else{
      var sum=ExpantaNum.ZERO.clone();
      var numOverride=numOverride.sub(ExpantaNum.ONE);
      while (numOverride.gte(ExpantaNum.ZERO)){
        var newSum=sum.add(getUpgradeCost(name,numOverride,["cheaperUpgrades","cheaperUpgrades3"]));
        if (newSum.eq(sum)) break;
        sum=newSum;
        numOverride=numOverride.sub(ExpantaNum.ONE);
      }
      returnValue=sum;
    }
  }
  if (["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4"].includes(name)&&!noreduction.includes("cheaperUpgrades")) returnValue=returnValue.div(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades));
  if (["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4","cheaperUpgrades","strongerGenerators5","strongerGenerators6","strongerGenerators7","cheaperUpgrades2","strongerGenerators8","strongerGenerators9","strongerGenerators10"].includes(name)&&!noreduction.includes("cheaperUpgrades3")) returnValue=returnValue.div(ExpantaNum.pow(1.08,game.upgrades.cheaperUpgrades3));
  if (saveCache) cache.maxUpgradeCost[name]=returnValue;
  return returnValue;
}
function canBuyUpgrade(name){
  return game.currency.gte(getUpgradeCost(name));
}
function buyUpgrade(event){
  var name;
  if (typeof event=="string") name=event;
  else name=event.srcElement.id.substring(0,event.srcElement.id.length-3);
  if (canBuyUpgrade(name)){
    game.currency=game.currency.sub(getUpgradeCost(name));
    game.upgrades[name]=game.upgrades[name].add(ExpantaNum.ONE);
    removeMaxUpgradeAmountCache();
    removeUpgradeCostCache([name]);
    if (name=="cheaperUpgrades") removeUpgradeCostCache(["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4"]);
    if (name=="cheaperUpgrades2") removeUpgradeCostCache(["strongerGenerators7"]);
    if (name=="cheaperUpgrades3") removeUpgradeCostCache(["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4","cheaperUpgrades","strongerGenerators5","strongerGenerators6","strongerGenerators7","cheaperUpgrades2","strongerGenerators8","strongerGenerators9","strongerGenerators10"]);
  }
}
function buyMaxUpgrade(event){
  var name;
  if (typeof event=="string") name=event;
  else name=event.srcElement.id.substring(0,event.srcElement.id.length-3);
  if (canBuyUpgrade(name)){
    var amount=getMaxUpgradeAmount(name);
    game.currency=game.currency.sub(getMaxUpgradeCost(name));
    game.upgrades[name]=game.upgrades[name].add(amount);
    removeMaxUpgradeAmountCache();
    removeUpgradeCostCache([name]);
    if (name=="cheaperUpgrades") removeUpgradeCostCache(["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4"]);
    if (name=="cheaperUpgrades2") removeUpgradeCostCache(["strongerGenerators7"]);
    if (name=="cheaperUpgrades3") removeUpgradeCostCache(["strongerGenerators","strongerGenerators2","strongerGenerators3","strongerGenerators4","cheaperUpgrades","strongerGenerators5","strongerGenerators6","strongerGenerators7","cheaperUpgrades2","strongerGenerators8","strongerGenerators9","strongerGenerators10"]);
  }
}
function autoBuy(){
  if (game.upgrades.autoBuy.gte(ExpantaNum.ONE)){
    buyMaxUpgrade("strongerGenerators");
    buyMaxUpgrade("strongerGenerators2");
    buyMaxUpgrade("strongerGenerators3");
    buyMaxUpgrade("strongerGenerators4");
  }
}
function updateDisplay(){
  dg("currency").innerHTML=game.currency;
  dg("currencyPerSecond").innerHTML=getCurrencyPerSecond();
  dg("generators").innerHTML=game.generators;
  dg("generatorCost").innerHTML=getGeneratorCost();
  if (game.generators.gt(ExpantaNum.ZERO)){
    dg("tabs").classList.remove("hidden");
  }
  for (var i in game.upgrades){
    if (game.upgrades.hasOwnProperty(i)){
      var factors=getUpgradeCostFactor(i);
      if (factors.type=="once"){
        dg(i+"Num").innerHTML=game.upgrades[i].eq(ExpantaNum.ZERO)?"not":"has";
      }else{
        dg(i+"Num").innerHTML=game.upgrades[i];
      }
      dg(i+"Cost").innerHTML=getUpgradeCost(i);
      if (canBuyUpgrade(i)){
        dg(i+"Buy").classList.remove("unavailable");
        if (factors.type!="once") dg(i+"Max").classList.remove("unavailable");
      }else{
        dg(i+"Buy").classList.add("unavailable");
        if (factors.type!="once") dg(i+"Max").classList.add("unavailable");
      }
      if (factors.type!="once") dg(i+"Max").innerHTML="Buy max ("+getMaxUpgradeAmount(i)+")";
    }
  }
  if (game.upgrades.strongerGenerators.gte(7)) dg("strongerGenerators2").classList.remove("hidden");
  if (game.upgrades.strongerGenerators2.gte(ExpantaNum.ONE)) dg("strongerGenerators3").classList.remove("hidden");
  dg("strongerGenerators3Eff").innerHTML=ExpantaNum.mul(30,ExpantaNum.pow(1.07,game.upgrades.strongerGenerators5));
  if (game.upgrades.strongerGenerators3.gte(ExpantaNum.TWO)) dg("strongerGenerators4").classList.remove("hidden");
  if (game.upgrades.strongerGenerators4.gte(3)) dg("cheaperUpgrades").classList.remove("hidden");
  if (game.upgrades.cheaperUpgrades.gte(4)) dg("strongerGenerators5").classList.remove("hidden");
  if (game.upgrades.strongerGenerators5.gte(4)) dg("strongerGenerators6").classList.remove("hidden");
  if (game.upgrades.strongerGenerators6.gte(2)) dg("autoBuy").classList.remove("hidden");
  if (game.upgrades.strongerGenerators6.gte(9)) dg("strongerGenerators7").classList.remove("hidden");
  if (game.upgrades.strongerGenerators7.gte(8)) dg("cheaperUpgrades2").classList.remove("hidden");
  if (game.upgrades.strongerGenerators7.gte(8)) dg("strongerGenerators8").classList.remove("hidden");
  if (game.upgrades.strongerGenerators7.gte(8)) dg("strongerGenerators9").classList.remove("hidden");
  if (game.upgrades.strongerGenerators7.gte(8)) dg("strongerGenerators10").classList.remove("hidden");
  dg("strongerGenerators6Eff").innerHTML=ExpantaNum.mul(40,ExpantaNum.pow(1.17,game.upgrades.strongerGenerators10));
  if (game.upgrades.strongerGenerators11.gte(ExpantaNum.ONE)){
    dg("strongerGenerators9Eff").innerHTML=ExpantaNum.mul(150,ExpantaNum.pow(1.17,game.upgrades.strongerGenerators10));
  }
  if (game.upgrades.strongerGenerators10.gte(4)) dg("cheaperUpgrades3").classList.remove("hidden");
  if (game.upgrades.cheaperUpgrades3.gte(5)) dg("strongerGenerators11").classList.remove("hidden");
  var time=new Date().getTime();
  framesInLastSecond.push(time);
  while (time-framesInLastSecond[0]>=1000) framesInLastSecond.shift();
  dg("fps").innerHTML=framesInLastSecond.length;
  if (game.offlinetime>0){
    dg("offline").classList.remove("hidden");
    dg("offlinetime").innerHTML=game.offlinetime;
    dg("offlinespeed").innerHTML=offlineBoost.speed;
  }else{
    dg("offline").classList.add("hidden");
  }
}
function changeScreen(event){
  var name;
  if (typeof event=="string") name=event;
  else name=event.srcElement.id.substring(5);
  var tabButtonList=dg("tabs").childNodes;
  for (var i=0;i<tabButtonList.length;i++){
    if (tabButtonList[i].nodeName!="BUTTON") continue;
    var scrName=tabButtonList[i].id.substring(5);
    if (scrName==name) dg(scrName).classList.remove("hidden");
    else dg(scrName).classList.add("hidden");
  }
}
var saveItemName="1g∞u";
function save(){
  localStorage.setItem(saveItemName,btoa(JSON.stringify(game)));
}
function load(){
  var loadedSave=localStorage.getItem(saveItemName);
  if (loadedSave===null) return;
  deepAssign(game,JSON.parse(atob(loadedSave)));
}
function deepAssign(target,source){
  for (var i in source){
    if (source.hasOwnProperty(i)){
      if ((typeof source[i]=="number")||(typeof source[i]=="string")||(source[i] instanceof Array)||(source[i] instanceof ExpantaNum)){
        target[i]=source[i];
      }else if (typeof source[i]=="object"){
        deepAssign(target[i],source[i]);
      }
    }
  }
  return target;
}
function wipe(){
  localStorage.removeItem(saveItemName);
  location.reload();
}
window.onload=function (){
  for (var i in onclicks){
    if (onclicks.hasOwnProperty(i)){
      dg(i).onclick=onclicks[i];
    }
  }
  load();
  var time=new Date().getTime();
  game.offlinetime+=time-game.lasttime;
  game.lasttime=time;
  offlineBoost={
    total:game.offlinetime,
  };
  changeScreen("main");
  setInterval(loop,0);
  setInterval(save,10000);
};