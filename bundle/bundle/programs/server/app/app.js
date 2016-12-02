var require = meteorInstall({"lib":{"collections":{"tradedb.js":function(){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// lib/collections/tradedb.js                                               //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
TradesDB = new Mongo.Collection('trades');                                  // 1
CandlesDB = new Mongo.Collection('candles');                                // 2
//////////////////////////////////////////////////////////////////////////////

}}},"server":{"getData.js":["meteor/meteor",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// server/getData.js                                                        //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});
                                                                            //
getCandlesFurl = function getCandlesFurl() {                                // 3
  HTTP.call('GET', 'http://webrates.truefx.com/rates/connect.html', {       // 4
    params: {                                                               // 5
      "c": "EUR/USD"                                                        // 6
    }                                                                       // 5
  }, function (error, response) {                                           // 4
    if (error) {                                                            // 10
      console.log(error);                                                   // 11
    } else {                                                                // 12
      var value = response.content.substring(7, 15) * 10000 % 10;           // 13
      var curTime = Math.round(+new Date() / 1000);                         // 14
                                                                            //
      CandlesDB.insert({                                                    // 16
        val: value,                                                         // 17
        curr: "EUR/USD",                                                    // 18
        curTime: curTime                                                    // 19
      });                                                                   // 16
    }                                                                       // 21
  });                                                                       // 22
};                                                                          // 24
                                                                            //
getTrades = function getTrades() {                                          // 26
  Trades.changes().run(function (err, result) {                             // 27
    result.each(Meteor.bindEnvironment(function (err, row) {                // 28
      Users.filter({ id: row.new_val.user_id }).run(function (err, res) {   // 29
        res.each(function (err, nres) {                                     // 30
          var name = "Jon Doe";                                             // 31
          if (nres.facebook) {                                              // 32
            name = nres.facebook.name;                                      // 33
          }                                                                 // 34
          var money = String(row.new_val.outcome);                          // 35
          var mclass = "";                                                  // 36
          var curr = "€";                                                   // 37
          var resultstr = "trade";                                          // 38
          var final = " from " + String(row.new_val.amount) + curr;         // 39
          var cm = ~~(new Date().valueOf() / 60000);                        // 40
          var type = row.new_val.type;                                      // 41
                                                                            //
          if (row.new_val.outcome == null) {                                // 43
            mclass = "event-bet";                                           // 44
            money = String(row.new_val.amount);                             // 45
            final = " on " + row.new_val.type;                              // 46
          } else if (row.new_val.outcome > 0) {                             // 47
            mclass = "event-win";                                           // 49
            resultstr = "win";                                              // 50
            type = null;                                                    // 51
          } else {                                                          // 52
            resultstr = "lost";                                             // 54
            mclass = "event-loss";                                          // 55
            type = null;                                                    // 56
          }                                                                 // 57
                                                                            //
          money = money.replace('-', '');                                   // 59
          var curTime = Math.round(+new Date() / 1000);                     // 60
                                                                            //
          TradesDB.insert({                                                 // 62
            money: money,                                                   // 63
            mclass: mclass,                                                 // 64
            curr: curr,                                                     // 65
            resultstr: resultstr,                                           // 66
            final: final,                                                   // 67
            name: name,                                                     // 68
            cm: cm,                                                         // 69
            curTime: curTime,                                               // 70
            type: type                                                      // 71
          });                                                               // 62
        });                                                                 // 73
      });                                                                   // 74
    }));                                                                    // 75
  });                                                                       // 76
};                                                                          // 77
//////////////////////////////////////////////////////////////////////////////

}],"methods.js":function(){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// server/methods.js                                                        //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
if (Meteor.isServer) {                                                      // 1
  Trades = new Rethink.Table('trade');                                      // 2
  Users = new Rethink.Table('user');                                        // 3
                                                                            //
  Meteor.publish('trades', function () {                                    // 5
    this.ready();                                                           // 6
    return TradesDB.find();                                                 // 7
  });                                                                       // 8
                                                                            //
  Meteor.publish('candles', function () {                                   // 11
    this.ready();                                                           // 12
    return CandlesDB.find();                                                // 13
  });                                                                       // 14
                                                                            //
  Meteor.methods({                                                          // 16
                                                                            //
    getTrades: function () {                                                // 18
      function getTrades() {                                                // 18
        var out = Trades.count().run();                                     // 19
        return out;                                                         // 20
      }                                                                     // 21
                                                                            //
      return getTrades;                                                     // 18
    }()                                                                     // 18
  });                                                                       // 16
}                                                                           // 23
//////////////////////////////////////////////////////////////////////////////

},"main.js":["meteor/meteor",function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// server/main.js                                                           //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});
                                                                            //
Meteor.startup(function () {                                                // 3
  Meteor.setInterval(getCandlesFurl, 1000);                                 // 4
  getTrades();                                                              // 5
  //Code to run at Startup                                                  // 6
});                                                                         // 7
//////////////////////////////////////////////////////////////////////////////

}]}},{"extensions":[".js",".json"]});
require("./lib/collections/tradedb.js");
require("./server/getData.js");
require("./server/methods.js");
require("./server/main.js");
//# sourceMappingURL=app.js.map
