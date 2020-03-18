function dg(s){
  return document.getElementById(s);
}
var onclicks={};
var game={
  currency:ExpantaNum(0),
  generators:ExpantaNum(0),
  upgrades:{
    strongerGenerators:ExpantaNum(0),
    strongerGenerators2:ExpantaNum(0),
    strongerGenerators3:ExpantaNum(0),
    strongerGenerators4:ExpantaNum(0),
    cheaperUpgrades:ExpantaNum(0),
    strongerGenerators5:ExpantaNum(0)
  },
  lasttime:new Date().getTime(),
  debug:{
    timescale:1
  }
};
function loop(){
  var time=new Date().getTime();
  var dt=(time-game.lasttime)*game.debug.timescale;
  game.currency=game.currency.add(getCurrencyPerSecond().times(dt/1000));
  updateDisplay();
  game.lasttime=time;
}
function getCurrencyPerSecond(){
  var r=game.generators;
  r=r.mul(ExpantaNum.pow(1.1,game.upgrades.strongerGenerators));
  r=r.mul(ExpantaNum.pow(1.15,game.upgrades.strongerGenerators2));
  r=r.mul(ExpantaNum.pow(1.3,game.upgrades.strongerGenerators3));
  r=r.mul(ExpantaNum.pow(1.05,game.upgrades.strongerGenerators3.mul(game.upgrades.strongerGenerators4).mul(ExpantaNum.pow(1.07,game.upgrades.strongerGenerators5))));
  return r;
}
function getGeneratorCost(){
  if (game.generators.eq(0)) return ExpantaNum(0);
  else return ExpantaNum(Infinity);
}
function canBuyGenerator(){
  return game.currency.gte(getGeneratorCost());
}
function buyGenerator(){
  if (canBuyGenerator()){
    game.currency=game.currency.sub(getGeneratorCost());
    game.generators=game.generators.add(1);
  }
}
function getUpgradeCostFactor(name){
  if (name=="strongerGenerators"){
    return {
      type:"exponential",
      base:ExpantaNum(1/4).div(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades)),
      exponent:ExpantaNum(2)
    };
  }else if (name=="strongerGenerators2"){
    return {
      type:"exponential",
      base:ExpantaNum(70).div(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades)),
      exponent:ExpantaNum(3)
    };
  }else if (name=="strongerGenerators3"){
    return {
      type:"doubleGeometric",
      base:ExpantaNum(150).div(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades)),
      exponent:{
        base:ExpantaNum(1.5),
        exponent:ExpantaNum(1.2)
      }
    };
  }else if (name=="strongerGenerators4"){
    return {
      type:"doubleGeometric",
      base:ExpantaNum(400).div(ExpantaNum.pow(1.05,game.upgrades.cheaperUpgrades)),
      exponent:{
        base:ExpantaNum(1.7),
        exponent:ExpantaNum(1.3)
      }
    };
  }else if (name=="cheaperUpgrades"){
    return {
      type:"doubleGeometric",
      base:ExpantaNum(2000),
      exponent:{
        base:ExpantaNum(1.05),
        exponent:ExpantaNum(1.05)
      }
    };
  }else if (name=="strongerGenerators5"){
    return {
      type:"doubleExponential",
      base:ExpantaNum(1000/27),
      exponent:{
        base:ExpantaNum(3),
        scale:ExpantaNum(4),
        exponent:ExpantaNum(1.2)
      }
    };
  }
}
function getUpgradeCost(name,offset){
  if (typeof offset=="undefined") offset=ExpantaNum(0);
  var factors=getUpgradeCostFactor(name);
  var num=game.upgrades[name].add(offset);
  if (factors.type=="exponential"){
    return factors.base.mul(factors.exponent.pow(num));
  }else if (factors.type=="doubleGeometric"){
    return factors.base.mul(factors.exponent.base.pow(num)).mul(factors.exponent.exponent.pow(num.times(num.sub(1)).div(2)));
  }else if (factors.type=="doubleExponential"){
    return factors.base.mul(factors.exponent.base.pow(factors.exponent.scale.mul(factors.exponent.exponent.pow(num))));
  }
}
function getMaxUpgradeAmount(name){
  var factors=getUpgradeCostFactor(name);
  if (!canBuyUpgrade(name)) return ExpantaNum(0);
  if (factors.type=="exponential"){
    return ExpantaNum.affordGeometricSeries(game.currency,factors.base,factors.exponent,game.upgrades[name]);
  }else{
    var test;
    var t={};
    if (factors.type=="doubleGeometric"){
      t.x=game.currency;
      t.b=factors.base;
      t.y=factors.exponent.base;
      t.z=factors.exponent.exponent;
      t.logz=t.z.log();
      t.ly2lz=t.y.log().mul(2).div(t.logz);
      test=t.x.div(t.b).log().mul(8).div(t.logz).add(t.ly2lz.sub(1).pow(2)).sqrt().sub(t.ly2lz).add(1).div(2); //https://www.wolframalpha.com/input/?i=x%3Db*y%5Ek*z%5E%28%28k%5E2-k%29%2F2%29+solve+for+k&lang=ja
    }
    if (factors.type=="doubleGeometric"){
      t.x=game.currency;
      t.b=factors.base;
      t.y=factors.exponent.base;
      t.z=factors.exponent.exponent;
      t.logz=t.z.log();
      t.ly2lz=t.y.log().mul(2).div(t.logz);
      test=t.x.div(t.b).log().mul(8).div(t.logz).add(t.ly2lz.sub(1).pow(2)).sqrt().sub(t.ly2lz).add(1).div(2); //https://www.wolframalpha.com/input/?i=x%3Db*y%5Ek*z%5E%28%28k%5E2-k%29%2F2%29+solve+for+k&lang=ja
    }
    if (factors.type=="doubleExponential"){
      t.x=game.currency;
      t.a=factors.base;
      t.b=factors.exponent.base;
      t.c=factors.exponent.scale;
      t.d=factors.exponent.exponent;
      test=t.x.div(t.a).log().div(t.c.mul(t.b.log())).log().div(t.d.log()); //https://www.wolframalpha.com/input/?i=x%3Db*y%5Ek*z%5E%28%28k%5E2-k%29%2F2%29+solve+for+k&lang=ja
    }
    t=null;
    test=test.add(1).floor();
    while (getMaxUpgradeCost(name,test).gt(game.currency)){
      var newTest=test.sub(1);
      if (newTest.eq(test)) break;
      test=newTest;
    }
    return test;
  }
}
function getMaxUpgradeCost(name,numOverride){
  if (typeof numOverride=="undefined") numOverride=getMaxUpgradeAmount(name);
  if (numOverride.eq(0)) return ExpantaNum(0);
  var factors=getUpgradeCostFactor(name);
  if (factors.type=="exponential"){
    return ExpantaNum.sumGeometricSeries(numOverride,factors.base,factors.exponent,game.upgrades[name]);
  }else{
    var sum=ExpantaNum(0);
    var numOverride=numOverride.sub(1);
    while (numOverride.gte(0)){
      var newSum=sum.add(getUpgradeCost(name,numOverride));
      if (newSum.eq(sum)) break;
      sum=newSum;
      numOverride=numOverride.sub(1);
    }
    return sum;
  }
}
function canBuyUpgrade(name){
  return game.currency.gte(getUpgradeCost(name));
}
function buyUpgrade(event){
  var name=event.srcElement.id.substring(0,event.srcElement.id.length-3);
  if (canBuyUpgrade(name)){
    game.currency=game.currency.sub(getUpgradeCost(name));
    game.upgrades[name]=game.upgrades[name].add(1);
  }
}
function buyMaxUpgrade(event){
  var name=event.srcElement.id.substring(0,event.srcElement.id.length-3);
  if (canBuyUpgrade(name)){
    var amount=getMaxUpgradeAmount(name);
    game.currency=game.currency.sub(getMaxUpgradeCost(name));
    game.upgrades[name]=game.upgrades[name].add(amount);
  }
}
function updateDisplay(){
  dg("currency").innerHTML=game.currency;
  dg("currencyPerSecond").innerHTML=getCurrencyPerSecond();
  dg("generators").innerHTML=game.generators;
  dg("generatorCost").innerHTML=getGeneratorCost();
  if (game.generators.gt(0)){
    dg("tabs").classList.remove("hidden");
  }
  for (var i in game.upgrades){
    if (game.upgrades.hasOwnProperty(i)){
      dg(i+"Num").innerHTML=game.upgrades[i];
      dg(i+"Cost").innerHTML=getUpgradeCost(i);
      if (canBuyUpgrade(i)){
        dg(i+"Buy").classList.remove("unavailable");
        dg(i+"Max").classList.remove("unavailable");
      }else{
        dg(i+"Buy").classList.add("unavailable");
        dg(i+"Max").classList.add("unavailable");
      }
      dg(i+"Max").innerHTML="Buy max ("+getMaxUpgradeAmount(i)+")";
    }
  }
  if (game.upgrades.strongerGenerators.gte(7)) dg("strongerGenerators2").classList.remove("hidden");
  if (game.upgrades.strongerGenerators2.gte(1)) dg("strongerGenerators3").classList.remove("hidden");
  if (game.upgrades.strongerGenerators3.gte(2)) dg("strongerGenerators4").classList.remove("hidden");
  dg("strongerGenerators4Eff").innerHTML=ExpantaNum.mul(5,ExpantaNum.pow(1.07,game.upgrades.strongerGenerators5));
  if (game.upgrades.strongerGenerators4.gte(3)) dg("cheaperUpgrades").classList.remove("hidden");
  if (game.upgrades.cheaperUpgrades.gte(4)) dg("strongerGenerators5").classList.remove("hidden");
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
  changeScreen("main");
  setInterval(loop,0);
  setInterval(save,10000);
};