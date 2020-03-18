function dg(s){
  return document.getElementById(s);
}
var onclicks={};
var game={
  currency:ExpantaNum(0),
  generators:ExpantaNum(0),
  upgrades:{
    strongerGenerators:ExpantaNum(0)
  },
  lasttime:new Date().getTime()
};
function loop(){
  var time=new Date().getTime();
  var dt=time-game.lasttime;
  game.currency=game.currency.add(getCurrencyPerSecond().times(dt/1000));
  updateDisplay();
  game.lasttime=time;
}
function getCurrencyPerSecond(){
  var r=game.generators;
  r=r.mul(ExpantaNum.pow(1.1,game.upgrades.strongerGenerators));
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
      base:ExpantaNum(1/4),
      exponent:ExpantaNum(2)
    };
  }
}
function getUpgradeCost(name){
  var factors=getUpgradeCostFactor(name);
  return factors.base.mul(factors.exponent.pow(game.upgrades[name]));
}
function getMaxUpgradeAmount(name){
  var factors=getUpgradeCostFactor(name);
  return ExpantaNum.affordGeometricSeries(game.currency,factors.base,factors.exponent,game.upgrades[name]);
}
function getMaxUpgradeCost(name){
  var factors=getUpgradeCostFactor(name);
  return ExpantaNum.sumGeometricSeries(getMaxUpgradeAmount(name),factors.base,factors.exponent,game.upgrades[name]);
}
function canBuyUpgrade(name){
  return game.currency.gte(getUpgradeCost(name));
}
function buyUpgrade(event){
  var name=event.srcElement.id;
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
        dg(i).classList.remove("unavailable");
        dg(i+"Max").classList.remove("unavailable");
      }else{
        dg(i).classList.add("unavailable");
        dg(i+"Max").classList.add("unavailable");
      }
      dg(i+"Max").innerHTML="Buy max ("+getMaxUpgradeAmount(i)+")";
    }
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
  changeScreen("main");
  setInterval(loop,0);
  setInterval(save,10000);
};