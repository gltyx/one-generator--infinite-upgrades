(function (globalScope) { //Custom constants
  globalScope.ExpantaNum.TWO = ExpantaNum(2);
})(this);

function dg(s) {
  return document.getElementById(s);
}
var onclicks = {};
var game = {
  currency: ExpantaNum.ZERO.clone(),
  generators: ExpantaNum.ZERO.clone(),
  upgrades: {
    strongerGenerators: ExpantaNum.ZERO.clone(),
    strongerGenerators2: ExpantaNum.ZERO.clone(),
    strongerGenerators3: ExpantaNum.ZERO.clone(),
    strongerGenerators4: ExpantaNum.ZERO.clone(),
    cheaperUpgrades: ExpantaNum.ZERO.clone(),
    strongerGenerators5: ExpantaNum.ZERO.clone(),
    strongerGenerators6: ExpantaNum.ZERO.clone(),
    autoBuy: ExpantaNum.ZERO.clone(),
    strongerGenerators7: ExpantaNum.ZERO.clone(),
    cheaperUpgrades2: ExpantaNum.ZERO.clone(),
    strongerGenerators8: ExpantaNum.ZERO.clone(),
    strongerGenerators9: ExpantaNum.ZERO.clone(),
    strongerGenerators10: ExpantaNum.ZERO.clone(),
    cheaperUpgrades3: ExpantaNum.ZERO.clone(),
    strongerGenerators11: ExpantaNum.ZERO.clone(),
    strongerGenerators12: ExpantaNum.ZERO.clone(),
    autoBuy2: ExpantaNum.ZERO.clone(),
    strongerGenerators13: ExpantaNum.ZERO.clone(),
    cheaperUpgrades4: ExpantaNum.ZERO.clone(),
    cheaperUpgrades5: ExpantaNum.ZERO.clone(),
    strongerGenerators14: ExpantaNum.ZERO.clone(),
    strongerGenerators15: ExpantaNum.ZERO.clone(),
    strongerGenerators16: ExpantaNum.ZERO.clone(),
    cheaperUpgrades6: ExpantaNum.ZERO.clone(),
    strongerGenerators17: ExpantaNum.ZERO.clone(),
    strongerGenerators18: ExpantaNum.ZERO.clone(),
    cheaperUpgrades7: ExpantaNum.ZERO.clone(),
    strongerGenerators19: ExpantaNum.ZERO.clone(),
    cheaperUpgrades8: ExpantaNum.ZERO.clone(),
    strongerGenerators20: ExpantaNum.ZERO.clone(),
    cheaperUpgrades9: ExpantaNum.ZERO.clone(),
    autoBuy3: ExpantaNum.ZERO.clone()
  },
  hidden: {
    autoBuy: false,
    autoBuy2: false,
    ascension: {
      autoBuy4: false,
      autoBuy7: false
    }
  },
  ascension: {
    ascensions: ExpantaNum.ZERO.clone(),
    ascensionPoints: ExpantaNum.ZERO.clone(),
    upgrades: {
      strongerGenerators: ExpantaNum.ZERO.clone(),
      autoBuy: ExpantaNum.ZERO.clone(),
      efficientPrestige: ExpantaNum.ZERO.clone(),
      strongerGenerators2: ExpantaNum.ZERO.clone(),
      efficientPrestige2: ExpantaNum.ZERO.clone(),
      strongerGenerators3: ExpantaNum.ZERO.clone(),
      cheaperUpgrades: ExpantaNum.ZERO.clone(),
      efficientPrestige3: ExpantaNum.ZERO.clone(),
      efficientPrestige4: ExpantaNum.ZERO.clone(),
      strongerGenerators4: ExpantaNum.ZERO.clone(),
      autoBuy2: ExpantaNum.ZERO.clone(),
      cheaperUpgrades2: ExpantaNum.ZERO.clone(),
      autoBuy3: ExpantaNum.ZERO.clone(),
      efficientPrestige5: ExpantaNum.ZERO.clone(),
      autoBuy4: ExpantaNum.ZERO.clone(),
      autoBuy5: ExpantaNum.ZERO.clone(),
      efficientPrestige6: ExpantaNum.ZERO.clone(),
      autoBuy6: ExpantaNum.ZERO.clone(),
      cheaperUpgrades3: ExpantaNum.ZERO.clone(),
      autoBuy7: ExpantaNum.ZERO.clone(),
      efficientPrestige7: ExpantaNum.ZERO.clone()
    }
  },
  timer: {
    autoBuy3TowerIncrease: ExpantaNum.ZERO.clone(),
    ascension: {
      autoBuy6Cooldown: ExpantaNum.ZERO.clone()
    }
  },
  lasttime: new Date().getTime(),
  offlinetime: 0,
  options: {
    notationPlaces: 6,
    offlineSpeedFactor: 9
  },
  debug: {
    timescale: 1
  }
};
var framesInLastSecond = [];
var offlineBoost;

function loop() {
  var time = new Date().getTime();
  var dt = (time - game.lasttime) * game.debug.timescale;
  if (game.offlinetime > 0) {
    var speed;
    if (game.options.offlineSpeedFactor === 0) speed = 1;
    else if (game.offlinetime > offlineBoost.total / 2) speed = Math.max((offlineBoost.total - game.offlinetime) * Math.pow(2, game.options.offlineSpeedFactor - 20) + 1, 1.1);
    else speed = Math.max(game.offlinetime * Math.pow(2, game.options.offlineSpeedFactor - 20) + 1, 1.1);
    if (dt + game.offlinetime > dt * speed) {
      game.offlinetime -= Math.ceil(dt * (speed - 1));
      dt = Math.ceil(dt * speed);
    } else {
      dt = dt + game.offlinetime;
      game.offlinetime = 0;
    }
    offlineBoost.speed = speed;
  }
  var newCurrency = game.currency.add(getCurrencyPerSecond().times(dt / 1000));
  if (game.currency.neq(newCurrency)) {
    removeMaxUpgradeAmountCache();
    game.currency = newCurrency;
  }
  cache.autoBuy3PerSecond = null;
  autoBuy(dt);
  updateDisplay(dt);
  removeUpdatedFlags();
  game.lasttime = time;
}
var cache = {
  upgradeCostFactor: {},
  upgradeCost: {},
  maxUpgradeAmount: {},
  maxUpgradeCost: {},
  autoBuy3PerSecond: null
};
var updated = {
  upgradeCost: {},
  upgradeAmount: {}
}

function setToGame(s, v) {
  var a = s.split(".");
  var o = game;
  for (var i = 0; i < a.length - 1; i++) {
    o = o[a[i]];
  }
  o[a[i]] = v;
}

function getFromGame(s) {
  var a = s.split(".");
  var o = game;
  for (var i = 0; i < a.length; i++) {
    o = o[a[i]];
  }
  return o;
}

function setUpgrade(s, v) {
  setToGame(convertToProperty(s), v);
}

function getUpgrade(s) {
  return getFromGame(convertToProperty(s));
}

function getUpgradeType(s) {
  var a = s.split(".");
  if (a[0] == "ascension") return "ascension";
  return "upgrades";
}

function setCurrencyUsed(s, v) {
  if (getUpgradeCostFactor(s).currency) return setToGame(getUpgradeCostFactor(s).currency, v);
  var a = getUpgradeType(s);
  if (a == "upgrades") game.currency = v;
  else if (a == "ascension") game.ascension.ascensionPoints = v;
}

function getCurrencyUsed(s) {
  if (getUpgradeCostFactor(s).currency) return getFromGame(getUpgradeCostFactor(s).currency);
  var t = getUpgradeType(s);
  if (t == "upgrades") return game.currency;
  else if (t == "ascension") return game.ascension.ascensionPoints;
}

function convertToProperty(s) {
  var t = getUpgradeType(s);
  var a = s.split(".");
  if (t == "upgrades") return "upgrades." + s
  else if (t == "ascension") return "ascension.upgrades." + a[1];
}
var upgradesList = {};
var fullUpgradesList = [];
(function () {
  var metalist = [
    ["upgrades", "upgrades", ""],
    ["ascension.upgrades", "ascension", "ascension."]
  ];
  for (var itemIndex = 0; itemIndex < metalist.length; itemIndex++) {
    var item = metalist[itemIndex];
    var list = getFromGame(item[0]);
    var name = item[1];
    var namePrefix = item[2];
    upgradesList[name] = [];
    for (var key in list) {
      if (list.hasOwnProperty(key)) {
        upgradesList[name].push(namePrefix + key);
        fullUpgradesList.push(namePrefix + key)
      }
    }
  }
})();

function removeUpgradeCostFactorCache(names) {
  if (typeof names == "undefined") names = fullUpgradesList;
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    cache.upgradeCostFactor[name] = null;
    cache.upgradeCost[name] = null;
    updated.upgradeCost[name] = true;
    cache.maxUpgradeAmount[name] = null;
    cache.maxUpgradeCost[name] = null;
  }
}

function removeUpgradeCostCache(names) {
  if (typeof names == "undefined") names = fullUpgradesList;
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    cache.upgradeCost[name] = null;
    updated.upgradeCost[name] = true;
    cache.maxUpgradeAmount[name] = null;
    cache.maxUpgradeCost[name] = null;
  }
}

function removeMaxUpgradeAmountCache(names) {
  if (typeof names == "undefined") names = fullUpgradesList;
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    cache.maxUpgradeAmount[name] = null;
    cache.maxUpgradeCost[name] = null;
  }
}

function removeMaxUpgradeCostCache(names) {
  if (typeof names == "undefined") names = fullUpgradesList;
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    cache.maxUpgradeCost[name] = null;
  }
}

function removeUpdatedFlags() {
  updated.upgradeCost = {};
  updated.upgradeAmount = {};
}

function getCurrencyPerSecond() {
  var r = game.generators;
  //If you think this multiplier should be in form (X*Y^Q)^P instead of current X^(P*Y^Q), DIY.
  r = r.mul(ExpantaNum.pow(1.1, game.upgrades.strongerGenerators.mul(ExpantaNum.pow(1.05, game.upgrades.strongerGenerators17)).mul(ExpantaNum.pow(1.01, game.ascension.upgrades.strongerGenerators2))));
  r = r.mul(ExpantaNum.pow(1.15, game.upgrades.strongerGenerators2.mul(ExpantaNum.pow(1.05, game.upgrades.strongerGenerators18))));
  r = r.mul(ExpantaNum.pow(1.3, game.upgrades.strongerGenerators3.mul(ExpantaNum.pow(1.07, game.upgrades.strongerGenerators5))));
  r = r.mul(ExpantaNum.pow(1.05, game.upgrades.strongerGenerators3.mul(game.upgrades.strongerGenerators4)));
  r = r.mul(ExpantaNum.pow(1.4, game.upgrades.strongerGenerators6.mul(ExpantaNum.pow(1.17, game.upgrades.strongerGenerators10.mul(ExpantaNum.pow(1.06, game.upgrades.strongerGenerators13))))));
  r = r.mul(ExpantaNum.pow(1.1, game.upgrades.strongerGenerators7.mul(ExpantaNum.pow(1.25, game.upgrades.strongerGenerators8))).pow(ExpantaNum.TWO));
  if (game.upgrades.strongerGenerators11.gte(ExpantaNum.ONE)) {
    r = r.mul(ExpantaNum.pow(2.5, game.upgrades.strongerGenerators9.mul(ExpantaNum.pow(1.17, game.upgrades.strongerGenerators10.mul(ExpantaNum.pow(1.06, game.upgrades.strongerGenerators13))))));
  } else {
    r = r.mul(ExpantaNum.pow(2.5, game.upgrades.strongerGenerators9));
  }
  r = r.mul(ExpantaNum.TWO.pow(game.upgrades.strongerGenerators8.logBase(ExpantaNum.TWO).max(ExpantaNum.ONE).mul(game.upgrades.strongerGenerators9.logBase(ExpantaNum.TWO).max(ExpantaNum.ONE)).mul(game.upgrades.strongerGenerators12)));
  r = r.mul(ExpantaNum.pow(5, game.upgrades.strongerGenerators14));
  r = r.mul(ExpantaNum.pow(1.04, game.upgrades.strongerGenerators14.pow(ExpantaNum.TWO).mul(game.upgrades.strongerGenerators15)));
  r = r.mul(ExpantaNum.pow(2.75, game.upgrades.strongerGenerators10.mul(game.upgrades.strongerGenerators16)));
  r = r.mul(ExpantaNum.pow(10, game.upgrades.strongerGenerators19.pow(5)));
  r = r.mul(ExpantaNum.pow(20, game.upgrades.strongerGenerators19.pow(ExpantaNum.TWO).mul(game.upgrades.strongerGenerators20.pow(4))));
  r = r.mul(ExpantaNum.pow(3, game.ascension.upgrades.strongerGenerators));
  r = r.mul(ExpantaNum.pow(10, game.ascension.upgrades.strongerGenerators3));
  if (game.currency.gt(ExpantaNum.ONE)) r = r.mul(ExpantaNum.pow(game.currency, game.ascension.upgrades.strongerGenerators4.div(10)));
  return r;
}

function getGeneratorCost() {
  if (game.generators.eq(ExpantaNum.ZERO)) return ExpantaNum.ZERO.clone();
  else return ExpantaNum.POSITIVE_INFINITY.clone();
}

function canBuyGenerator() {
  return game.currency.gte(getGeneratorCost());
}

function buyGenerator() {
  if (canBuyGenerator()) {
    game.currency = game.currency.sub(getGeneratorCost());
    game.generators = game.generators.add(ExpantaNum.ONE);
  }
}

function getUpgradeCostFactor(name) {
  if (cache.upgradeCostFactor[name]) return cache.upgradeCostFactor[name];
  var returnValue;
  if (name == "strongerGenerators") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum(1 / 4),
      exponent: ExpantaNum.TWO.clone()
    };
  } else if (name == "strongerGenerators2") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum(70),
      exponent: ExpantaNum(3)
    };
  } else if (name == "strongerGenerators3") {
    returnValue = {
      type: "doubleGeometric",
      base: ExpantaNum(150),
      exponent: {
        base: ExpantaNum(1.5),
        exponent: ExpantaNum(1.2)
      }
    };
  } else if (name == "strongerGenerators4") {
    returnValue = {
      type: "doubleGeometric",
      base: ExpantaNum(400),
      exponent: {
        base: ExpantaNum(1.7),
        exponent: ExpantaNum(1.3)
      }
    };
  } else if (name == "cheaperUpgrades") {
    returnValue = {
      type: "doubleGeometric",
      base: ExpantaNum(2000),
      exponent: {
        base: ExpantaNum(1.05),
        exponent: ExpantaNum(1.05)
      }
    };
  } else if (name == "strongerGenerators5") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(1000 / 27),
      exponent: {
        base: ExpantaNum(81),
        exponent: ExpantaNum(1.2)
      }
    };
  } else if (name == "strongerGenerators6") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(10000),
      exponent: {
        base: ExpantaNum(64),
        exponent: ExpantaNum(1.4)
      }
    };
  } else if (name == "autoBuy") {
    returnValue = {
      type: "once",
      cost: ExpantaNum(6e7)
    }
  } else if (name == "strongerGenerators7") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(5e39),
      exponent: {
        base: ExpantaNum.TWO.clone(),
        exponent: ExpantaNum.TWO.clone()
      }
    };
  } else if (name == "cheaperUpgrades2") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(5e80),
      exponent: {
        base: ExpantaNum(1.25),
        exponent: ExpantaNum(2.1)
      }
    };
  } else if (name == "strongerGenerators8") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum(1e81),
      exponent: {
        base: ExpantaNum(10),
        exponent: {
          base: ExpantaNum.TWO.clone(),
          power: ExpantaNum(1.1)
        }
      }
    };
  } else if (name == "strongerGenerators9") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum(5e82),
      exponent: {
        base: ExpantaNum(20),
        exponent: {
          base: ExpantaNum(1.75),
          power: ExpantaNum(1.15)
        }
      }
    };
  } else if (name == "strongerGenerators10") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum(2e84),
      exponent: {
        base: ExpantaNum(5),
        exponent: {
          base: ExpantaNum(1.45),
          power: ExpantaNum(1.17)
        }
      }
    };
  } else if (name == "cheaperUpgrades3") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum(2e89 / 9),
      exponent: {
        base: ExpantaNum(4),
        exponent: {
          base: ExpantaNum(1.45),
          power: ExpantaNum(1.2)
        }
      }
    };
  } else if (name == "strongerGenerators11") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("1e355")
    };
  } else if (name == "strongerGenerators12") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1.25e598"),
      exponent: {
        base: ExpantaNum(80),
        exponent: {
          base: ExpantaNum(1.5),
          power: ExpantaNum(1.22)
        }
      }
    };
  } else if (name == "autoBuy2") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("1e800")
    }
  } else if (name == "strongerGenerators13") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e888"),
      exponent: {
        base: ExpantaNum(1000),
        exponent: {
          base: ExpantaNum(1.6),
          power: ExpantaNum(1.3)
        }
      }
    };
  } else if (name == "cheaperUpgrades4") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e3070"),
      exponent: {
        base: ExpantaNum(1e12),
        exponent: {
          base: ExpantaNum(1.8),
          power: ExpantaNum(1.35)
        }
      }
    };
  } else if (name == "cheaperUpgrades5") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("1e3082")
    }
  } else if (name == "strongerGenerators14") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e3090"),
      exponent: {
        base: ExpantaNum(1.1),
        exponent: {
          base: ExpantaNum(1.5),
          power: ExpantaNum(1.35)
        }
      }
    };
  } else if (name == "strongerGenerators15") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("2e3119"),
      exponent: {
        base: ExpantaNum(5),
        exponent: {
          base: ExpantaNum(1.6),
          power: ExpantaNum(1.38)
        }
      }
    };
  } else if (name == "strongerGenerators16") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("2e3120"),
      exponent: {
        base: ExpantaNum(1e5),
        exponent: {
          base: ExpantaNum(1.25),
          power: ExpantaNum(1.45)
        }
      }
    };
  } else if (name == "cheaperUpgrades6") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e3773"),
      exponent: {
        base: ExpantaNum(1e4),
        exponent: {
          base: ExpantaNum(1.587),
          power: ExpantaNum(1.5)
        }
      }
    };
  } else if (name == "strongerGenerators17") {
    returnValue = {
      type: "list",
      list: [ExpantaNum("1e17295"), ExpantaNum("1e18572"), ExpantaNum("1e19223"), ExpantaNum("1e23592"), ExpantaNum("1e34307"), ExpantaNum("1e86474"), ExpantaNum("1e95385"), ExpantaNum("1e170000"), ExpantaNum("1e936000"), ExpantaNum("e1e6"), ExpantaNum("e1.248e6"), ExpantaNum("e4.61996e6")]
    };
  } else if (name == "strongerGenerators18") {
    returnValue = {
      type: "list",
      list: [ExpantaNum("3e33222"), ExpantaNum("1e35894"), ExpantaNum("1e49683"), ExpantaNum("1e100000"), ExpantaNum("1e232456"), ExpantaNum("1e589500"), ExpantaNum("e1.455e6"), ExpantaNum("e2.107e6"), ExpantaNum("e2.3e6"), ExpantaNum("e2.706e6"), ExpantaNum("e5.758e6"), ExpantaNum("e1.186e7")]
    };
  } else if (name == "cheaperUpgrades7") {
    returnValue = {
      type: "list",
      list: [ExpantaNum("1e25000"), ExpantaNum("1e30000"), ExpantaNum("1e580000"), ExpantaNum("e2.04748e7")]
    };
  } else if (name == "strongerGenerators19") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e50000"),
      exponent: {
        base: ExpantaNum(1e100),
        exponent: {
          base: ExpantaNum(1.6),
          power: ExpantaNum(1.6)
        }
      }
    };
  } else if (name == "cheaperUpgrades8") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("1e247000")
    };
  } else if (name == "strongerGenerators20") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e3.9e7"),
      exponent: {
        base: ExpantaNum("1e1e6"),
        exponent: {
          base: ExpantaNum(1.1),
          power: ExpantaNum.TWO
        }
      }
    };
  } else if (name == "cheaperUpgrades9") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("1e61841388")
    };
  } else if (name == "autoBuy3") {
    if (game.ascension.upgrades.cheaperUpgrades3.gte(ExpantaNum.ONE)) {
      returnValue = {
        type: "once",
        cost: ExpantaNum("ee10")
      }
    } else {
      returnValue = {
        type: "once",
        cost: ExpantaNum("10^^20")
      }
    }
  } else if (name == "ascension.strongerGenerators") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum.ONE.clone(),
      exponent: ExpantaNum.TWO.clone()
    }
  } else if (name == "ascension.autoBuy") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum.TWO.clone(),
      exponent: ExpantaNum(2.5)
    }
  } else if (name == "ascension.efficientPrestige") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum(5),
      exponent: ExpantaNum(3)
    }
  } else if (name == "ascension.strongerGenerators2") {
    returnValue = {
      type: "once",
      cost: ExpantaNum(10)
    }
  } else if (name == "ascension.efficientPrestige2") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum(15),
      exponent: ExpantaNum(3)
    }
  } else if (name == "ascension.strongerGenerators3") {
    returnValue = {
      type: "exponential",
      base: ExpantaNum(35),
      exponent: ExpantaNum(4)
    }
  } else if (name == "ascension.cheaperUpgrades") {
    returnValue = {
      type: "doubleGeometric",
      base: ExpantaNum(40),
      exponent: {
        base: ExpantaNum(1.2),
        exponent: ExpantaNum(1.1)
      }
    }
  } else if (name == "ascension.efficientPrestige3") {
    returnValue = {
      type: "doubleGeometric",
      base: ExpantaNum(100),
      exponent: {
        base: ExpantaNum(1.5),
        exponent: ExpantaNum(1.2)
      }
    }
  } else if (name == "ascension.efficientPrestige4") {
    returnValue = {
      type: "once",
      cost: ExpantaNum(1e10)
    }
  } else if (name == "ascension.strongerGenerators4") {
    returnValue = {
      type: "doubleGeometric",
      base: ExpantaNum(1e15),
      exponent: {
        base: ExpantaNum.TWO.clone(),
        exponent: ExpantaNum(1.5)
      }
    }
  } else if (name == "ascension.autoBuy2") {
    returnValue = {
      type: "once",
      cost: ExpantaNum(1e30)
    }
  } else if (name == "ascension.cheaperUpgrades2") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(2.5e39),
      exponent: {
        base: ExpantaNum(4),
        exponent: ExpantaNum(1.2)
      }
    }
  } else if (name == "ascension.autoBuy3") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(2e44),
      exponent: {
        base: ExpantaNum(5),
        exponent: ExpantaNum(1.4)
      }
    }
  } else if (name == "ascension.efficientPrestige5") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum(4e49),
      exponent: {
        base: ExpantaNum(2.5),
        exponent: ExpantaNum(1.5)
      }
    }
  } else if (name == "ascension.autoBuy4") {
    returnValue = {
      type: "once",
      cost: ExpantaNum(Number.MAX_VALUE)
    }
  } else if (name == "ascension.autoBuy5") {
    returnValue = {
      type: "doubleExponential",
      base: ExpantaNum("1e425"),
      exponent: {
        base: ExpantaNum(1e10),
        exponent: ExpantaNum(1.7)
      }
    }
  } else if (name == "ascension.efficientPrestige6") {
    returnValue = {
      type: "doubleExponentiatedPolynomial",
      base: ExpantaNum("1e580"),
      exponent: {
        base: ExpantaNum(1e20),
        exponent: {
          base: ExpantaNum(1.45),
          power: ExpantaNum(1.1)
        }
      }
    }
  } else if (name == "ascension.autoBuy6") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("ee20")
    }
  } else if (name == "ascension.cheaperUpgrades3") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("ee50")
    }
  } else if (name == "ascension.autoBuy7") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("ee150")
    }
  } else if (name == "ascension.efficientPrestige7") {
    returnValue = {
      type: "once",
      cost: ExpantaNum("ee500")
    }
  }
  cache.upgradeCostFactor[name] = returnValue;
  return returnValue;
}

function getUpgradeCost(name, offset, noreduction) {
  var saveCache = typeof offset != "undefined" && !noreduction;
  if (saveCache && cache.upgradeCost[name]) return cache.upgradeCost[name];
  if (typeof offset == "undefined") offset = ExpantaNum.ZERO.clone();
  if (typeof noreduction == "undefined") noreduction = [];
  var factors = getUpgradeCostFactor(name);
  var num = getUpgrade(name).add(offset);
  var returnValue;
  //slower scaling
  if (name == "strongerGenerators7" && !noreduction.includes("cheaperUpgrades2")) num = num.div(ExpantaNum.pow(1.1, game.upgrades.cheaperUpgrades2));
  if (upgradeEffectList.cheaperUpgrades6.includes(name) && !noreduction.includes("cheaperUpgrades6")) num = num.div(ExpantaNum.pow(1.2, game.upgrades.cheaperUpgrades6));
  if (name == "cheaperUpgrades4" && !noreduction.includes("cheaperUpgrades7")) num = num.div(ExpantaNum.pow(1.3, game.upgrades.cheaperUpgrades7));
  if (name == "strongerGenerators19" && !noreduction.includes("cheaperUpgrades8")) num = num.div(ExpantaNum.pow(1.3, game.upgrades.cheaperUpgrades8));
  if (game.upgrades.cheaperUpgrades9.gte(ExpantaNum.ONE) && upgradeEffectList.cheaperUpgrades9.includes(name) && !noreduction.includes("cheaperUpgrades8")) num = num.div(ExpantaNum.pow(1.3, game.upgrades.cheaperUpgrades8));
  if (factors.type == "exponential") {
    returnValue = factors.base.mul(factors.exponent.pow(num));
  } else if (factors.type == "doubleGeometric") {
    returnValue = factors.base.mul(factors.exponent.base.pow(num)).mul(factors.exponent.exponent.pow(num.times(num.sub(ExpantaNum.ONE)).div(ExpantaNum.TWO)));
  } else if (factors.type == "doubleExponential") {
    returnValue = factors.base.mul(factors.exponent.base.pow(factors.exponent.exponent.pow(num)));
  } else if (factors.type == "doubleExponentiatedPolynomial") {
    returnValue = factors.base.mul(factors.exponent.base.pow(factors.exponent.exponent.base.pow(num.pow(factors.exponent.exponent.power))));
  } else if (factors.type == "once") {
    if (num.eq(ExpantaNum.ZERO)) returnValue = factors.cost;
    else returnValue = ExpantaNum.POSITIVE_INFINITY.clone();
  } else if (factors.type == "list") {
    if (num.lt(factors.list.length)) returnValue = factors.list[num.array[0][1]];
    else returnValue = ExpantaNum.POSITIVE_INFINITY.clone();
  }
  if (upgradeEffectList.cheaperUpgrades.includes(name) && !noreduction.includes("cheaperUpgrades")) returnValue = returnValue.div(ExpantaNum.pow(1.05, game.upgrades.cheaperUpgrades.mul(ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades))));
  if (game.upgrades.cheaperUpgrades5.gte(ExpantaNum.ONE) && upgradeEffectList.cheaperUpgrades5.includes(name) && !noreduction.includes("cheaperUpgrades")) returnValue = returnValue.div(ExpantaNum.pow(1.05, game.upgrades.cheaperUpgrades.mul(ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades))));
  if (upgradeEffectList.cheaperUpgrades3.includes(name) && !noreduction.includes("cheaperUpgrades3")) returnValue = returnValue.div(ExpantaNum.pow(1.08, game.upgrades.cheaperUpgrades3.mul(ExpantaNum.pow(1.5, game.upgrades.cheaperUpgrades4))));
  if (upgradeEffectList.ascension.cheaperUpgrades2.includes(name) && !noreduction.includes("ascension.cheaperUpgrades2")) returnValue = returnValue.div(ExpantaNum.pow(1.2, game.ascension.upgrades.cheaperUpgrades2));
  if (saveCache) cache.upgradeCost = returnValue;
  return returnValue;
}

function getMaxUpgradeAmount(name) {
  if (cache.maxUpgradeAmount[name]) return cache.maxUpgradeAmount[name];
  var returnValue;
  if (!canBuyUpgrade(name)) {
    returnValue = ExpantaNum.ZERO.clone();
  } else {
    var effectiveCurrency = getCurrencyUsed(name);
    //percent cheaper
    if (upgradeEffectList.cheaperUpgrades.includes(name)) effectiveCurrency = effectiveCurrency.mul(ExpantaNum.pow(1.05, game.upgrades.cheaperUpgrades.mul(ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades))));
    if (game.upgrades.cheaperUpgrades5.gte(ExpantaNum.ONE) && upgradeEffectList.cheaperUpgrades5.includes(name)) effectiveCurrency = effectiveCurrency.mul(ExpantaNum.pow(1.05, game.upgrades.cheaperUpgrades.mul(ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades))));
    if (upgradeEffectList.cheaperUpgrades3.includes(name)) effectiveCurrency = effectiveCurrency.mul(ExpantaNum.pow(1.08, game.upgrades.cheaperUpgrades3.mul(ExpantaNum.pow(1.5, game.upgrades.cheaperUpgrades4))));
    if (upgradeEffectList.ascension.cheaperUpgrades2.includes(name)) effectiveCurrency = effectiveCurrency.mul(ExpantaNum.pow(1.2, game.ascension.upgrades.cheaperUpgrades2));
    var factors = getUpgradeCostFactor(name);
    if (factors.type == "exponential") {
      returnValue = ExpantaNum.affordGeometricSeries(effectiveCurrency, factors.base, factors.exponent, getUpgrade(name));
    } else if (factors.type == "once") {
      if (effectiveCurrency.gte(getUpgradeCost(name))) return ExpantaNum.ONE.clone();
      else return ExpantaNum.ZERO.clone();
    } else {
      var test;
      var t = {};
      if (factors.type == "doubleGeometric") {
        t.x = effectiveCurrency;
        t.b = factors.base;
        t.y = factors.exponent.base;
        t.z = factors.exponent.exponent;
        t.logz = t.z.log();
        t.ly2lz = t.y.log().mul(ExpantaNum.TWO).div(t.logz);
        upperbound = t.x.div(t.b).log().mul(8).div(t.logz).add(t.ly2lz.sub(ExpantaNum.ONE).pow(ExpantaNum.TWO)).sqrt().sub(t.ly2lz).add(ExpantaNum.ONE).div(ExpantaNum.TWO); //https://www.wolframalpha.com/input/?i=x%3Db*y%5Ek*z%5E%28%28k%5E2-k%29%2F2%29+solve+for+k&lang=ja
      } else if (factors.type == "doubleExponential") {
        t.x = effectiveCurrency;
        t.a = factors.base;
        t.b = factors.exponent.base;
        t.c = factors.exponent.exponent;
        upperbound = t.x.div(t.a).log().div(t.b.log()).log().div(t.c.log()); //https://www.wolframalpha.com/input/?i=x%3Da*b%5Ec%5Ek+solve+for+k&lang=ja
      } else if (factors.type == "doubleExponentiatedPolynomial") {
        t.x = effectiveCurrency;
        t.a = factors.base;
        t.b = factors.exponent.base;
        t.c = factors.exponent.exponent.base;
        t.d = factors.exponent.exponent.power;
        upperbound = t.x.div(t.a).log().div(t.b.log()).log().div(t.c.log()).root(t.d); //https://www.wolframalpha.com/input/?i=x%3Da*b%5Ec%5Ek%5Ed+solve+for+k&lang=ja
      } else if (factors.type == "list") {
        upperbound = ExpantaNum(factors.list.length - getUpgrade(name).array[0][1]);
      }
      //slower scaling
      if (name == "strongerGenerators7") upperbound = upperbound.mul(ExpantaNum.pow(1.1, game.upgrades.cheaperUpgrades2));
      if (upgradeEffectList.cheaperUpgrades6.includes(name)) upperbound = upperbound.mul(ExpantaNum.pow(1.2, game.upgrades.cheaperUpgrades6));
      if (name == "cheaperUpgrades4") upperbound = upperbound.mul(ExpantaNum.pow(1.3, game.upgrades.cheaperUpgrades7));
      if (name == "strongerGenerators19") upperbound = upperbound.mul(ExpantaNum.pow(1.3, game.upgrades.cheaperUpgrades8));
      if (game.upgrades.cheaperUpgrades9.gte(ExpantaNum.ONE) && upgradeEffectList.cheaperUpgrades9.includes(name)) upperbound = upperbound.mul(ExpantaNum.pow(1.3, game.upgrades.cheaperUpgrades8));
      t = null;
      upperbound = upperbound.ceil();
      if (effectiveCurrency.gte(getMaxUpgradeCost(name, upperbound, ["cheaperUpgrades", "cheaperUpgrades3", "ascension.cheaperUpgrades2"]))) return upperbound;
      var lowerbound = ExpantaNum.ZERO.clone();
      while (true) {
        var test = lowerbound.add(upperbound).div(ExpantaNum.TWO).floor();
        if (lowerbound.eq(upperbound) || lowerbound.eq(test) || upperbound.eq(test)) {
          returnValue = lowerbound;
          break;
        }
        var sum = getMaxUpgradeCost(name, test, ["cheaperUpgrades", "cheaperUpgrades3", "ascension.cheaperUpgrades2"]);
        var cmp = effectiveCurrency.cmp(sum);
        if (cmp === 0) { //eq
          returnValue = test;
          break;
        } else if (cmp == 1) { //gt
          lowerbound = test;
        } else if (cmp == -1) { //lt
          upperbound = test;
        } else { //NaN
          throw Error("Something is NaN--" + name);
        }
      }
    }
  }
  cache.maxUpgradeAmount[name] = returnValue;
  return returnValue;
}

function getMaxUpgradeCost(name, numOverride, noreduction) {
  var saveCache = typeof numOverride != "undefined" && !noreduction;
  if (saveCache && cache.maxUpgradeCost[name]) cache.maxUpgradeCost[name];
  if (typeof numOverride == "undefined") numOverride = getMaxUpgradeAmount(name);
  if (typeof noreduction == "undefined") noreduction = [];
  var returnValue;
  if (numOverride.eq(ExpantaNum.ZERO)) {
    returnValue = ExpantaNum.ZERO.clone();
  } else {
    var factors = getUpgradeCostFactor(name);
    if (factors.type == "exponential") {
      returnValue = ExpantaNum.sumGeometricSeries(numOverride, factors.base, factors.exponent, getUpgrade(name));
    } else if (factors.type == "once") {
      if (getUpgrade(name).eq(ExpantaNum.ZERO) && numOverride.eq(ExpantaNum.ONE)) return factors.cost;
      else return ExpantaNum.POSITIVE_INFINITY.clone();
    } else {
      var sum = ExpantaNum.ZERO.clone();
      var numOverride = numOverride.sub(ExpantaNum.ONE);
      var lastCost = ExpantaNum.NaN;
      while (numOverride.gte(ExpantaNum.ZERO)) {
        var cost = getUpgradeCost(name, numOverride, ["cheaperUpgrades", "cheaperUpgrades3", "ascension.cheaperUpgrades2"]);
        if (cost.eq(lastCost)) {
          sum.add(cost.mul(numOverride));
          break;
        }
        var newSum = sum.add(cost);
        if (newSum.eq(sum)) break;
        sum = newSum;
        lastCost = cost;
        numOverride = numOverride.sub(ExpantaNum.ONE);
      }
      returnValue = sum;
    }
  }
  //percent cheaper
  if (upgradeEffectList.cheaperUpgrades.includes(name) && !noreduction.includes("cheaperUpgrades")) returnValue = returnValue.div(ExpantaNum.pow(1.05, game.upgrades.cheaperUpgrades.mul(ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades))));
  if (game.upgrades.cheaperUpgrades5.gte(ExpantaNum.ONE) && upgradeEffectList.cheaperUpgrades5.includes(name) && !noreduction.includes("cheaperUpgrades")) returnValue = returnValue.div(ExpantaNum.pow(1.05, game.upgrades.cheaperUpgrades.mul(ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades))));
  if (upgradeEffectList.cheaperUpgrades3.includes(name) && !noreduction.includes("cheaperUpgrades3")) returnValue = returnValue.div(ExpantaNum.pow(1.08, game.upgrades.cheaperUpgrades3.mul(ExpantaNum.pow(1.5, game.upgrades.cheaperUpgrades4))));
  if (upgradeEffectList.ascension.cheaperUpgrades2.includes(name) && !noreduction.includes("ascension.cheaperUpgrades2")) returnValue = returnValue.div(ExpantaNum.pow(1.2, game.ascension.upgrades.cheaperUpgrades2));
  if (saveCache) cache.maxUpgradeCost[name] = returnValue;
  return returnValue;
}

function canBuyUpgrade(name) {
  var currency = getCurrencyUsed(name);
  return currency.neq(ExpantaNum.ZERO) && currency.gte(getUpgradeCost(name));
}

function buyUpgrade(event) {
  var name;
  if (typeof event == "string") name = event;
  else name = event.srcElement.id.substring(0, event.srcElement.id.length - 3);
  if (canBuyUpgrade(name)) {
    var cost = getUpgradeCost(name);
    var currency = getCurrencyUsed(name);
    if (getUpgrade(name).eq(getUpgrade(name).add(ExpantaNum.ONE))) return;
    if (currency.eq(cost) && currency.gte(ExpantaNum.E_MAX_SAFE_INTEGER)) setCurrencyUsed(name, currency.div(ExpantaNum.MAX_SAFE_INTEGER).div(ExpantaNum.TWO));
    else setCurrencyUsed(name, currency.sub(cost));
    setUpgrade(name, getUpgrade(name).add(ExpantaNum.ONE));
    removeMaxUpgradeAmountCache();
    removeUpgradeCostCache([name]);
    if (name == "cheaperUpgrades") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades);
    if (name == "cheaperUpgrades5" || name == "cheaperUpgrades" && game.upgrades.cheaperUpgrades5.gte(ExpantaNum.ONE)) removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades5);
    if (name == "cheaperUpgrades2") removeUpgradeCostCache(["strongerGenerators7"]);
    if (name == "cheaperUpgrades3" || name == "cheaperUpgrades4") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades3);
    if (name == "cheaperUpgrades6") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades6);
    if (name == "cheaperUpgrades7") removeUpgradeCostCache(["cheaperUpgrades4"]);
    if (name == "cheaperUpgrades8") removeUpgradeCostCache(["strongerGenerators19"]);
    if (name == "cheaperUpgrades9") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades9);
    if (name == "ascension.cheaperUpgrades2") removeUpgradeCostCache(upgradeEffectList.ascension.cheaperUpgrades2);
    if (name == "ascension.cheaperUpgrades3") removeUpgradeCostFactorCache(["autoBuy3"]);
    updated.upgradeAmount[name] = true;
  }
}

function buyMaxUpgrade(event) {
  var name;
  if (typeof event == "string") name = event;
  else name = event.srcElement.id.substring(0, event.srcElement.id.length - 3);
  if (canBuyUpgrade(name)) {
    var amount = getMaxUpgradeAmount(name);
    var cost = getMaxUpgradeCost(name);
    var currency = getCurrencyUsed(name);
    if (cost.gt(currency)) {
      console.warn("Somehow buy max can spend more than currency... probably imprecision?");
      cost = currency.clone();
    }
    if (getUpgrade(name).eq(getUpgrade(name).add(amount))) return;
    if (currency.eq(cost) && currency.gte(ExpantaNum.E_MAX_SAFE_INTEGER)) setCurrencyUsed(name, currency.div(ExpantaNum.MAX_SAFE_INTEGER).div(ExpantaNum.TWO));
    else setCurrencyUsed(name, currency.sub(cost));
    setUpgrade(name, getUpgrade(name).add(amount));
    removeMaxUpgradeAmountCache();
    removeUpgradeCostCache([name]);
    if (name == "cheaperUpgrades") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades);
    if (name == "cheaperUpgrades5" || name == "cheaperUpgrades" && game.upgrades.cheaperUpgrades5.gte(ExpantaNum.ONE)) removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades5);
    if (name == "cheaperUpgrades2") removeUpgradeCostCache(["strongerGenerators7"]);
    if (name == "cheaperUpgrades3" || name == "cheaperUpgrades4") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades3);
    if (name == "cheaperUpgrades6") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades6);
    if (name == "cheaperUpgrades7") removeUpgradeCostCache(["cheaperUpgrades4"]);
    if (name == "cheaperUpgrades8") removeUpgradeCostCache(["strongerGenerators19"]);
    if (name == "cheaperUpgrades9") removeUpgradeCostCache(upgradeEffectList.cheaperUpgrades9);
    if (name == "ascension.cheaperUpgrades2") removeUpgradeCostCache(upgradeEffectList.ascension.cheaperUpgrades2);
    if (name == "ascension.cheaperUpgrades3") removeUpgradeCostFactorCache(["autoBuy3"]);
    updated.upgradeAmount[name] = true;
  }
}

function buyMaxAllUpgrade(event) {
  var name;
  if (typeof event == "string") name = event;
  else name = event.srcElement.id.substring(0, event.srcElement.id.length - 6);
  for (var i of upgradesList[name]) buyMaxUpgrade(i);
}
var upgradeEffectList = {
  cheaperUpgrades: ["strongerGenerators", "strongerGenerators2", "strongerGenerators3", "strongerGenerators4"],
  autoBuy: ["strongerGenerators", "strongerGenerators2", "strongerGenerators3", "strongerGenerators4"],
  cheaperUpgrades3: ["strongerGenerators", "strongerGenerators2", "strongerGenerators3", "strongerGenerators4", "cheaperUpgrades", "strongerGenerators5", "strongerGenerators6", "strongerGenerators7", "cheaperUpgrades2", "strongerGenerators8", "strongerGenerators9", "strongerGenerators10"],
  autoBuy2: ["cheaperUpgrades", "strongerGenerators5", "strongerGenerators6", "strongerGenerators7", "cheaperUpgrades2", "strongerGenerators8", "strongerGenerators9", "strongerGenerators10", "cheaperUpgrades3"],
  cheaperUpgrades5: ["strongerGenerators5", "strongerGenerators6", "strongerGenerators7"],
  cheaperUpgrades6: ["strongerGenerators14", "strongerGenerators15", "strongerGenerators16"],
  cheaperUpgrades9: ["strongerGenerators10", "strongerGenerators12", "strongerGenerators20"],
  ascension: {
    cheaperUpgrades2: ["ascension.strongerGenerators", "ascension.autoBuy", "ascension.efficientPrestige", "ascension.efficientPrestige2", "ascension.strongerGenerators3", "ascension.cheaperUpgrades", "ascension.efficientPrestige3", "ascension.strongerGenerators4"],
    autoBuy4: ["ascension.strongerGenerators", "ascension.autoBuy", "ascension.efficientPrestige", "ascension.efficientPrestige2", "ascension.strongerGenerators3", "ascension.cheaperUpgrades", "ascension.efficientPrestige3", "ascension.strongerGenerators4", "ascension.cheaperUpgrades2", "ascension.autoBuy3"],
    autoBuy7: ["ascension.efficientPrestige5", "ascension.autoBuy5", "ascension.efficientPrestige6"]
  }
};

function autoBuy(dt) {
  if (game.ascension.upgrades.autoBuy2.eq(ExpantaNum.ONE)) {
    buyMaxAllUpgrade("upgrades");
  } else {
    if (game.upgrades.autoBuy.eq(ExpantaNum.ONE)) {
      for (var i of upgradeEffectList.autoBuy) buyMaxUpgrade(i);
    }
    if (game.upgrades.autoBuy2.eq(ExpantaNum.ONE)) {
      for (i of upgradeEffectList.autoBuy2) buyMaxUpgrade(i);
    }
  }
  if (game.upgrades.autoBuy3.eq(ExpantaNum.ONE)) {
    if (game.upgrades.strongerGenerators13.gte(ExpantaNum.EE_MAX_SAFE_INTEGER) || getAutoBuy3PerSecond(dt).gt(ExpantaNum.MAX_SAFE_INTEGER)) {
      game.timer.autoBuy3TowerIncrease = game.timer.autoBuy3TowerIncrease.add(getAutoBuy3PerSecond(dt).mul(dt / 1000));
      if (!game.timer.autoBuy3TowerIncrease.isFinite()) {
        console.warn("ab3 is attempting to buy " + game.timer.autoBuy3TowerIncrease + " times, please report this!");
        game.timer.autoBuy3TowerIncrease = ExpantaNum.ZERO.clone();
      } else if (game.timer.autoBuy3TowerIncrease.gte(ExpantaNum.ONE)) {
        var f = game.timer.autoBuy3TowerIncrease.floor();
        game.upgrades.strongerGenerators13 = game.upgrades.strongerGenerators13.layeradd10(f);
        game.timer.autoBuy3TowerIncrease = game.timer.autoBuy3TowerIncrease.sub(f);
        updated.upgradeAmount.strongerGenerators13 = true;
        updated.upgradeCost.strongerGenerators13 = true;
      }
    }
  } else if (game.upgrades.autoBuy3.eq(ExpantaNum.TWO)) {
    game.timer.autoBuy3TowerIncrease = ExpantaNum.ZERO.clone();
  }
  if (game.ascension.upgrades.autoBuy4.eq(ExpantaNum.ONE)) {
    for (i of upgradeEffectList.ascension.autoBuy4) buyMaxUpgrade(i);
  }
  if (game.ascension.upgrades.autoBuy6.eq(ExpantaNum.ONE) && game.ascension.upgrades.efficientPrestige7.neq(ExpantaNum.ONE)) {
    game.timer.ascension.autoBuy6Cooldown = game.timer.ascension.autoBuy6Cooldown.add(dt / 1000);
    if (!game.timer.ascension.autoBuy6Cooldown.isFinite()) {
      console.warn("aab6 timer has went non-finite");
      game.timer.ascension.autoBuy6Cooldown = ExpantaNum.ZERO.clone();
    } else if (game.timer.ascension.autoBuy6Cooldown.gte(ExpantaNum.ONE)) {
      ascension();
      game.timer.ascension.autoBuy6Cooldown = ExpantaNum.ZERO.clone();
    }
  } else if (game.ascension.upgrades.autoBuy6.eq(ExpantaNum.TWO)) {
    game.timer.ascension.autoBuy6Cooldown = ExpantaNum.ZERO.clone();
  }
  if (game.ascension.upgrades.autoBuy7.eq(ExpantaNum.ONE)) {
    for (i of upgradeEffectList.ascension.autoBuy7) buyMaxUpgrade(i);
  }
  if (game.ascension.upgrades.efficientPrestige7.eq(ExpantaNum.ONE) && game.ascension.ascensionPoints.gte(ExpantaNum.ONE) && getAscensionPointGain().gte(game.ascension.ascensionPoints)) {
    var t = {};
    t.n = dt / 1000;
    t.a = game.ascension.ascensionPoints;
    t.k = getAscensionPointGain().div(t.a);
    t.y = game.ascension.upgrades.efficientPrestige6;
    t.yn20mn = t.y.div(20).pow(t.n);
    game.ascension.ascensionPoints = t.a.pow(t.yn20mn).mul(t.k.pow(t.yn20mn.mul(20).sub(20).div(t.y.sub(20)))); //https://www.wolframalpha.com/input/?i=f%280%29%3Da%2C+f%28n%2B1%29%3Dk*f%28n%29%5E%28y%2F20%29&lang=ja
    t = null;
  }
}

function getAutoBuy3PerSecond(dt) {
  if (cache.autoBuy3PerSecond) return cache.autoBuy3PerSecond;
  var r = ExpantaNum.TWO.pow(game.ascension.upgrades.autoBuy);
  r = r.mul(ExpantaNum.pow(1.4, game.ascension.upgrades.cheaperUpgrades2.mul(game.ascension.upgrades.autoBuy3)));
  if (game.ascension.upgrades.autoBuy5.gt(ExpantaNum.ZERO)) {
    if (game.upgrades.autoBuy.eq(ExpantaNum.ONE) || game.ascension.upgrades.autoBuy2.eq(ExpantaNum.ONE)) r = r.mul(game.upgrades.strongerGenerators.slog().pow(ExpantaNum.pow(game.ascension.upgrades.autoBuy5.mul(0.1).add(ExpantaNum.ONE), dt / 100)));
    else r = r.mul(game.upgrades.strongerGenerators.slog().pow(ExpantaNum.mul(0.1, game.ascension.upgrades.autoBuy5)));
  }
  cache.autoBuy3PerSecond = r;
  return r;
}

function toggleAutoBuy(event) {
  var name;
  if (typeof event == "string") name = event;
  else name = event.srcElement.id.substring(0, event.srcElement.id.length - 6);
  if (getUpgrade(name).eq(ExpantaNum.ONE)) setUpgrade(name, ExpantaNum.TWO.clone());
  else setUpgrade(name, ExpantaNum.ONE.clone());
}

function toggleAutoBuyHide(event) {
  var name;
  if (typeof event == "string") name = event;
  else name = event.srcElement.id.substring(0, event.srcElement.id.length - 4);
  setToGame("hidden." + name, !getFromGame("hidden." + name));
}

function getAscensionPointGain() {
  if (game.currency.lt("10^^20")) return ExpantaNum.ZERO.clone();
  var r = game.currency.slog().logBase(20);
  r = r.mul(ExpantaNum.TWO.pow(game.ascension.upgrades.efficientPrestige));
  r = r.mul(ExpantaNum.pow(3, game.ascension.upgrades.efficientPrestige3));
  r = r.mul(ExpantaNum.pow(1.15, game.ascension.upgrades.efficientPrestige3.mul(game.ascension.upgrades.efficientPrestige5)));
  if (game.ascension.ascensionPoints.gte(ExpantaNum.ONE)) r = r.mul(ExpantaNum.pow(game.ascension.ascensionPoints, game.ascension.upgrades.efficientPrestige6.div(20)));
  return r.floor();
}

function ascension() {
  var pointGain = getAscensionPointGain();
  if (pointGain.eq(ExpantaNum.ZERO)) return false;
  game.ascension.ascensions = game.ascension.ascensions.add(ExpantaNum.ONE);
  game.ascension.ascensionPoints = game.ascension.ascensionPoints.add(getAscensionPointGain());
  if (game.ascension.upgrades.efficientPrestige2.eq(ExpantaNum.ZERO)) game.currency = ExpantaNum.ZERO.clone();
  else game.currency = ExpantaNum.pow(1e5, game.ascension.upgrades.efficientPrestige2);
  for (var i = 0; i < upgradesList.upgrades.length; i++) {
    var name = upgradesList.upgrades[i];
    if (name == "autoBuy" && game.ascension.upgrades.efficientPrestige4.gte(ExpantaNum.ONE)) continue;
    if (name == "autoBuy2" && game.ascension.upgrades.autoBuy2.gte(ExpantaNum.ONE)) continue;
    game.upgrades[name] = ExpantaNum.ZERO.clone();
    dg(name).classList.add("hidden");
    if (name.substring(0, 7) == "autoBuy") dg(name + "Toggle").classList.add("hidden");
  }
  removeUpgradeCostCache(upgradesList.upgrades);
  if (game.ascension.upgrades.efficientPrestige4.eq(ExpantaNum.ZERO)) {
    dg("autoBuyHide").classList.add("hidden");
    game.hidden.autoBuy = false;
  }
  if (game.ascension.upgrades.autoBuy2.eq(ExpantaNum.ZERO)) {
    dg("autoBuy2Hide").classList.add("hidden");
    game.hidden.autoBuy2 = false;
  }
  dg("doAscensionContainer").classList.add("hidden");
  firstFrame = true;
  return true;
}

function N(x, rounded = false) {
  if(x.isInfinite()) return "∞";
  if(x.lt(10)){
    const prec = rounded ? 0 : 1;
    return x.toNumber().toLocaleString("en-US", {minimumFractionDigits: prec, maximumFractionDigits: prec});
  };
  if(x.lt(1e6)) return x.toNumber().toLocaleString("en-US", {minimumFractionDigits: 0, maximumFractionDigits: 0});
  if(x.lt("eeeee10")) return x.toExponential(game.options.notationPlaces);
  return `(10↑↑${x.array[1][1]})↑${x.array[0][1]}`;
}

function showIf(s, f) {
  if (typeof s == "string") {
    if (dg(s).classList.contains("hidden") && f()) {
      dg(s).classList.remove("hidden");
      if (fullUpgradesList.includes(s)) {
        updated.upgradeCost[s] = true;
        updated.upgradeAmount[s] = true;
      }
    }
  } else {
    var b;
    for (var i of s) {
      if (dg(i).classList.contains("hidden") && (typeof b == "undefined" ? (b = f()) : b)) dg(i).classList.remove("hidden");
      if (fullUpgradesList.includes(i)) {
        updated.upgradeCost[i] = true;
        updated.upgradeAmount[i] = true;
      }
    }
  }
}
var currentScreen;

function updateDisplay(dt) {
  updateDisplayTop(dt);
  if (currentScreen == "main") updateDisplayMain(dt);
  else if (currentScreen == "upgrades") updateDisplayUpgrades(dt);
  else if (currentScreen = "ascension") updateDisplayAscension(dt);
  updateDisplayTopEnd(dt);
  firstFrame = false;
}

function updateDisplayTop(dt) {
  dg("currency").textContent = N(game.currency);
  dg("currencyPerSecond").textContent = N(getCurrencyPerSecond());
  if (dg("tabs").classList.contains("hidden") && game.generators.gt(ExpantaNum.ZERO)) {
    dg("buyGenerator").classList.add("unavailable");
    dg("tabs").classList.remove("hidden");
  }
  showIf(["ascensionPointsContainer", "tabs.ascension"], function () {
    return game.ascension.ascensions.gte(ExpantaNum.ONE);
  });
  dg("ascensionPoints").textContent = N(game.ascension.ascensionPoints);
}

function updateDisplayMain(dt) {
  dg("generators").textContent = game.generators;
  dg("generatorCost").textContent = getGeneratorCost();
}

function updateDisplayUpgradesFromNamespace(name) {
  var o;
  if (name == "upgrades") o = upgradesList.upgrades;
  else if (name == "ascension") o = upgradesList.ascension;
  for (var itemIndex = 0; itemIndex < o.length; itemIndex++) {
    var i = o[itemIndex];
    if (dg(i).classList.contains("hidden")) continue;
    var factors = getUpgradeCostFactor(i);
    if (firstFrame || updated.upgradeAmount[i]) {
      if (factors.type == "once") {
        dg(i + "Num").textContent = getUpgrade(i).eq(ExpantaNum.ZERO) ? "not" : "has";
      } else {
        dg(i + "Num").textContent = N(getUpgrade(i));
      }
    }
    if (firstFrame || updated.upgradeCost[i]) dg(i + "Cost").textContent = N(getUpgradeCost(i));
    if (canBuyUpgrade(i)) {
      dg(i + "Buy").classList.remove("unavailable");
      if (factors.type != "once") dg(i + "Max").classList.remove("unavailable");
    } else {
      dg(i + "Buy").classList.add("unavailable");
      if (factors.type != "once") dg(i + "Max").classList.add("unavailable");
    }
    if (factors.type != "once") dg(i + "Max").textContent = "Buy Max (+" + N(getMaxUpgradeAmount(i), true) + ")";
  }
}

function updateDisplayUpgrades(dt) {
  showIf("upgradesMaxAllContainer", function () {
    return game.ascension.ascensions.gte(ExpantaNum.ONE);
  });
  if (game.hidden.autoBuy) {
    for (var i of upgradeEffectList.autoBuy) dg(i).classList.add("hidden");
  } else {
    showIf("strongerGenerators", function () {
      return game.generators.gte(ExpantaNum.ONE);
    });
    showIf("strongerGenerators2", function () {
      return game.upgrades.strongerGenerators.gte(7);
    });
    showIf("strongerGenerators3", function () {
      return game.upgrades.strongerGenerators2.gte(ExpantaNum.ONE);
    });
    showIf("strongerGenerators4", function () {
      return game.upgrades.strongerGenerators3.gte(ExpantaNum.TWO);
    });
  }
  if (game.hidden.autoBuy2) {
    for (var i of upgradeEffectList.autoBuy2) dg(i).classList.add("hidden");
  } else {
    showIf("cheaperUpgrades", function () {
      return game.upgrades.strongerGenerators4.gte(3);
    });
    dg("cheaperUpgradesEff").textContent = N(ExpantaNum.pow(1.05, ExpantaNum.pow(1.1, game.ascension.upgrades.cheaperUpgrades)).sub(ExpantaNum.ONE).mul(100));
    showIf("strongerGenerators5", function () {
      return game.upgrades.cheaperUpgrades.gte(4);
    });
    showIf("strongerGenerators6", function () {
      return game.upgrades.strongerGenerators5.gte(4);
    });
    showIf("strongerGenerators7", function () {
      return game.upgrades.strongerGenerators6.gte(9);
    });
    showIf(["cheaperUpgrades2", "strongerGenerators8", "strongerGenerators9", "strongerGenerators10"], function () {
      return game.upgrades.strongerGenerators7.gte(8);
    });
    showIf("cheaperUpgrades3", function () {
      return game.upgrades.strongerGenerators10.gte(4);
    });
  }
  dg("strongerGeneratorsEff").textContent = N(ExpantaNum.pow(1.1, ExpantaNum.pow(1.05, game.upgrades.strongerGenerators17).mul(ExpantaNum.pow(1.01, game.ascension.upgrades.strongerGenerators2))).sub(ExpantaNum.ONE).mul(100));
  dg("strongerGenerators2Eff").textContent = N(ExpantaNum.pow(1.15, ExpantaNum.pow(1.05, game.upgrades.strongerGenerators18)).sub(ExpantaNum.ONE).mul(100));
  dg("strongerGenerators3Eff").textContent = N(ExpantaNum.pow(1.3, ExpantaNum.pow(1.07, game.upgrades.strongerGenerators5)).sub(ExpantaNum.ONE).mul(100));
  dg("strongerGenerators6Eff").textContent = N(ExpantaNum.pow(1.4, ExpantaNum.pow(1.17, game.upgrades.strongerGenerators10.pow(ExpantaNum.pow(1.06, game.upgrades.strongerGenerators13)))).sub(ExpantaNum.ONE).mul(100));
  showIf("autoBuy", function () {
    return game.upgrades.strongerGenerators6.gte(ExpantaNum.TWO);
  });
  showIf(["autoBuyToggle", "autoBuyHide"], function () {
    return game.upgrades.autoBuy.gte(ExpantaNum.ONE);
  });
  dg("autoBuyToggle").textContent = game.upgrades.autoBuy.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  dg("autoBuyHide").textContent = game.hidden.autoBuy ? "Hidden" : "Shown";
  if (game.upgrades.strongerGenerators11.gte(ExpantaNum.ONE)) {
    dg("strongerGenerators9Eff").textContent = N(ExpantaNum.pow(2.5, ExpantaNum.pow(1.17, game.upgrades.strongerGenerators10.mul(ExpantaNum.pow(1.06, game.upgrades.strongerGenerators13)))).sub(ExpantaNum.ONE).mul(100));
  }
  dg("strongerGenerators10Eff").textContent = N(ExpantaNum.pow(1.17, ExpantaNum.pow(1.06, game.upgrades.strongerGenerators13)).sub(ExpantaNum.ONE).mul(100));
  dg("cheaperUpgrades3Eff").textContent = N(ExpantaNum.pow(1.08, ExpantaNum.pow(1.5, game.upgrades.cheaperUpgrades4)).sub(ExpantaNum.ONE).mul(100));
  showIf("strongerGenerators11", function () {
    return game.upgrades.cheaperUpgrades3.gte(5);
  });
  showIf("strongerGenerators12", function () {
    return game.upgrades.strongerGenerators11.gte(ExpantaNum.ONE);
  });
  showIf(["autoBuy2", "strongerGenerators13"], function () {
    return game.upgrades.strongerGenerators12.gte(6);
  });
  showIf(["autoBuy2Toggle", "autoBuy2Hide"], function () {
    return game.upgrades.autoBuy2.gte(ExpantaNum.ONE);
  });
  dg("autoBuy2Toggle").textContent = game.upgrades.autoBuy2.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  dg("autoBuy2Hide").textContent = game.hidden.autoBuy2 ? "Hidden" : "Shown";
  showIf(["cheaperUpgrades4", "cheaperUpgrades5"], function () {
    return game.upgrades.strongerGenerators13.gte(7);
  });
  showIf("strongerGenerators14", function () {
    return game.upgrades.cheaperUpgrades5.gte(ExpantaNum.ONE);
  });
  showIf("strongerGenerators15", function () {
    return game.upgrades.strongerGenerators14.gte(8);
  });
  showIf("strongerGenerators16", function () {
    return game.upgrades.strongerGenerators15.gte(3);
  });
  showIf("cheaperUpgrades6", function () {
    return game.upgrades.strongerGenerators16.gte(7);
  });
  showIf("strongerGenerators17", function () {
    return game.upgrades.cheaperUpgrades6.gte(6);
  });
  showIf(["strongerGenerators18", "cheaperUpgrades7"], function () {
    return game.upgrades.strongerGenerators17.gte(4);
  });
  showIf("strongerGenerators19", function () {
    return game.upgrades.strongerGenerators17.gte(5);
  });
  showIf("cheaperUpgrades8", function () {
    return game.upgrades.strongerGenerators18.gte(5);
  });
  showIf("strongerGenerators20", function () {
    return game.upgrades.strongerGenerators18.gte(12);
  });
  showIf("cheaperUpgrades9", function () {
    return game.upgrades.strongerGenerators20.gte(6);
  });
  showIf(["autoBuy3", "doAscensionContainer"], function () {
    return game.upgrades.strongerGenerators13.gte("10^^10");
  });
  showIf("autoBuy3Toggle", function () {
    return game.upgrades.autoBuy3.gte(ExpantaNum.ONE);
  });
  dg("autoBuy3Toggle").textContent = game.upgrades.autoBuy3.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  if (game.ascension.upgrades.autoBuy.gte(ExpantaNum.ONE)) dg("autoBuy3Eff").textContent = N(getAutoBuy3PerSecond()) + " times";
  var ascensionPointGain = getAscensionPointGain();
  dg("doAscension").textContent = N(ascensionPointGain) + " ascension points";
  if (ascensionPointGain.eq(ExpantaNum.ZERO)) dg("doAscension").classList.add("unavailable");
  else dg("doAscension").classList.remove("unavailable");
  updateDisplayUpgradesFromNamespace("upgrades");
}

function updateDisplayAscension(dt) {
  showIf("ascensionMaxAllContainer", function () {
    return game.ascension.upgrades.autoBuy2.gte(ExpantaNum.ONE);
  });
  var ascensionPointGain = getAscensionPointGain();
  dg("doAscensionQuick").textContent = N(ascensionPointGain) + " ascension points";
  if (ascensionPointGain.eq(ExpantaNum.ZERO)) dg("doAscensionQuick").classList.add("unavailable");
  else dg("doAscensionQuick").classList.remove("unavailable");
  if (game.hidden.ascension.autoBuy4) {
    for (var i of upgradeEffectList.ascension.autoBuy4) dg(i).classList.add("hidden");
  } else {
    showIf("ascension.strongerGenerators", function () {
      return game.ascension.ascensions.gte(ExpantaNum.ONE);
    });
    showIf(["ascension.autoBuy", "ascension.efficientPrestige"], function () {
      return game.ascension.upgrades.strongerGenerators.gte(ExpantaNum.ONE);
    });
    showIf(["ascension.efficientPrestige2", "ascension.strongerGenerators3", "ascension.cheaperUpgrades"], function () {
      return game.ascension.upgrades.strongerGenerators2.gte(ExpantaNum.ONE);
    });
    showIf("ascension.efficientPrestige3", function () {
      return game.ascension.upgrades.cheaperUpgrades.gte(3);
    });
    showIf("ascension.strongerGenerators4", function () {
      return game.ascension.upgrades.efficientPrestige4.gte(ExpantaNum.ONE);
    });
    showIf("ascension.cheaperUpgrades2", function () {
      return game.ascension.upgrades.strongerGenerators4.gte(20);
    });
    showIf("ascension.autoBuy3", function () {
      return game.ascension.upgrades.cheaperUpgrades2.gte(10);
    });
  }
  if (game.hidden.ascension.autoBuy7) {
    for (var i of upgradeEffectList.ascension.autoBuy7) dg(i).classList.add("hidden");
  } else {
    showIf("ascension.efficientPrestige5", function () {
      return game.ascension.upgrades.autoBuy3.gte(6);
    });
    showIf("ascension.autoBuy5", function () {
      return game.ascension.upgrades.efficientPrestige5.gte(16);
    });
    showIf("ascension.efficientPrestige6", function () {
      return game.ascension.upgrades.autoBuy5.gte(5);
    });
  }
  showIf("ascension.strongerGenerators2", function () {
    return game.ascension.upgrades.efficientPrestige.gte(ExpantaNum.ONE);
  });
  showIf("ascension.efficientPrestige4", function () {
    return game.ascension.upgrades.efficientPrestige3.gte(12);
  });
  showIf("ascension.autoBuy2", function () {
    return game.ascension.upgrades.strongerGenerators4.gte(10);
  });
  showIf("ascension.autoBuy2Toggle", function () {
    return game.ascension.upgrades.autoBuy2.gte(ExpantaNum.ONE);
  });
  dg("ascension.autoBuy2Toggle").textContent = game.ascension.upgrades.autoBuy2.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  showIf("ascension.autoBuy4", function () {
    return game.ascension.upgrades.efficientPrestige5.gte(14);
  });
  showIf(["ascension.autoBuy4Toggle", "ascension.autoBuy4Hide"], function () {
    return game.ascension.upgrades.autoBuy4.gte(ExpantaNum.ONE);
  });
  dg("ascension.autoBuy4Toggle").textContent = game.ascension.upgrades.autoBuy4.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  dg("ascension.autoBuy4Hide").textContent = game.hidden.ascension.autoBuy4 ? "Hidden" : "Shown";
  showIf("ascension.autoBuy6", function () {
    return game.ascension.upgrades.efficientPrestige6.gte(30);
  });
  showIf("ascension.autoBuy6Toggle", function () {
    return game.ascension.upgrades.autoBuy6.gte(ExpantaNum.ONE);
  });
  dg("ascension.autoBuy6Toggle").textContent = game.ascension.upgrades.autoBuy6.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  showIf("ascension.cheaperUpgrades3", function () {
    return game.ascension.upgrades.efficientPrestige6.gte(100);
  });
  showIf("ascension.autoBuy7", function () {
    return game.ascension.upgrades.efficientPrestige6.gte(400);
  });
  showIf(["ascension.autoBuy7Toggle", "ascension.autoBuy7Hide"], function () {
    return game.ascension.upgrades.autoBuy7.gte(ExpantaNum.ONE);
  });
  dg("ascension.autoBuy7Toggle").textContent = game.ascension.upgrades.autoBuy7.eq(ExpantaNum.ONE) ? "Enabled" : "Disabled";
  dg("ascension.autoBuy7Hide").textContent = game.hidden.ascension.autoBuy7 ? "Hidden" : "Shown";
  showIf("ascension.efficientPrestige7", function () {
    return game.ascension.upgrades.efficientPrestige6.gte(500);
  });
  updateDisplayUpgradesFromNamespace("ascension");
}

function updateDisplayTopEnd(dt) {
  var time = new Date().getTime();
  framesInLastSecond.push(time);
  while (time - framesInLastSecond[0] >= 1000 && framesInLastSecond.length > 5) framesInLastSecond.shift();
  dg("fps").textContent = ((framesInLastSecond.length - 1) / (time - framesInLastSecond[0]) * 1000).toPrecision(3);
  if (game.offlinetime > 0) {
    dg("offline").classList.remove("hidden");
    dg("offlinetime").textContent = game.offlinetime;
    dg("offlinespeed").textContent = offlineBoost.speed.toPrecision(6);
  } else {
    dg("offline").classList.add("hidden");
  }
  if (wipeClicks > 0 && game.lasttime - lastWipeClickTime > 2000) {
    wipeClicks--;
    lastWipeClickTime = new Date().getTime();
    dg("wipeButton").textContent = wipeButtonText[wipeClicks];
  }
}
var screenList = ["main", "upgrades", "ascension", "options"];

function changeScreen(event) {
  var name;
  if (typeof event == "string") name = event;
  else name = event.srcElement.id.substring(5);
  for (var i = 0; i < screenList.length; i++) {
    var scrName = screenList[i];
    if (scrName == name) dg(scrName).classList.remove("hidden");
    else dg(scrName).classList.add("hidden");
  }
  currentScreen = name;
  firstFrame = true;
}

function changeNotationPlaces() {
  game.options.notationPlaces = Number(dg("notationPlaces").value);
  dg("notationPlacesDisp").textContent = game.options.notationPlaces;
}

function changeOfflineSpeedFactor() {
  game.options.offlineSpeedFactor = Number(dg("offlineSpeedFactor").value);
  dg("offlineSpeedFactorDisp").textContent = game.options.offlineSpeedFactor;
}
var saveItemName = "1g∞u";
var firstFrame;

function save() {
  localStorage.setItem(saveItemName, btoa(JSON.stringify(game)));
}

function load() {
  var loadedSave = localStorage.getItem(saveItemName);
  if (loadedSave === null) return;
  deepAssign(game, JSON.parse(atob(loadedSave)));
  dg("notationPlaces").value = game.options.notationPlaces;
  dg("notationPlacesDisp").textContent = game.options.notationPlaces;
  dg("offlineSpeedFactor").value = game.options.offlineSpeedFactor;
  dg("offlineSpeedFactorDisp").textContent = game.options.offlineSpeedFactor;
}

function deepAssign(target, source) {
  var isExpantaNum = /^[-\+]*(Infinity|NaN|(J+|J\^\d+ )?(10(\^+|\{[1-9]\d*\})|\(10(\^+|\{[1-9]\d*\})\)\^[1-9]\d* )*((\d+(\.\d*)?|\d*\.\d+)?([Ee][-\+]*))*(0|\d+(\.\d*)?|\d*\.\d+))$/;
  for (var i in source) {
    if (source.hasOwnProperty(i)) {
      if ((typeof source[i] == "boolean") || (typeof source[i] == "number") || (source[i] instanceof Array) || (source[i] instanceof ExpantaNum)) {
        target[i] = source[i];
      } else if (typeof source[i] == "string") {
        if (isExpantaNum.test(source[i])) target[i] = ExpantaNum(source[i]);
        else target[i] = source[i];
      } else if (typeof source[i] == "object") {
        deepAssign(target[i], source[i]);
      }
    }
  }
  return target;
}
var wipeClicks = 0;
var lastWipeClickTime;
var wipeButtonText = ["Wipe save", "Click again", "Are you sure?", "Are you actually sure?", "This is your last chance!", "Deleting save..."];

function wipe() {
  wipeClicks++;
  lastWipeClickTime = new Date().getTime();
  dg("wipeButton").textContent = wipeButtonText[wipeClicks];
  if (wipeClicks >= 5) {
    localStorage.removeItem(saveItemName);
    location.reload();
  }
}

function exportSave() {
  save();
  dg("saveArea").value = localStorage.getItem(saveItemName);
}

function importSave() {
  var s = dg("saveArea").value;
  JSON.parse(atob(s));
  localStorage.setItem(saveItemName, s);
  location.reload();
}
var changelogCache = "";

function seeChangelog() {
  if (changelogCache) dg("saveArea").value = changelogCache;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.status == 200) {
        dg("saveArea").value = this.responseText;
        changelogCache = this.responseText;
      } else {
        dg("saveArea").value = "Unable to get changelog";
      }
    }
  };
  xhttp.open("GET", "./changelog.md", true);
  xhttp.send();
}
window.onload = function () {
  for (var i in onclicks) {
    if (onclicks.hasOwnProperty(i)) {
      dg(i).onclick = onclicks[i];
    }
  }
  load();
  var time = new Date().getTime();
  game.offlinetime += time - game.lasttime;
  game.lasttime = time;
  offlineBoost = {
    total: game.offlinetime,
  };
  ExpantaNum.serializeMode = ExpantaNum.STRING;
  changeScreen("main");
  setInterval(loop, 0);
  setInterval(save, 10000);
};