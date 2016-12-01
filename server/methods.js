if (Meteor.isServer) {
  Trades = new Rethink.Table('trade');
  Users = new Rethink.Table('user');
  //TradesDB = new Mongo.Collection('trades');
  var r = Rethink.r;


  Meteor.publish('trades', function (mid) {
    let self = this;

    Trades.changes().run((err, result) => {
      result.each(Meteor.bindEnvironment(function (err, row) {

        Users.filter({id: row.new_val.user_id}).run(function (err, res) {
          res.each(function (err, nres) {
            let name = "Jon Doe";
            if (nres.facebook) {
              name = nres.facebook.name;
            }
            let money = String(row.new_val.outcome);
            let mclass = "";
            let curr = "€";
            let resultstr = "trade";
            let final = " from " + String(row.new_val.amount) + curr;
            let cm = ~~(new Date().valueOf() / 60000);

            if (row.new_val.outcome == null) {
              mclass = "event-bet";
              money = String(row.new_val.amount);
              final = " on " + row.new_val.type;
              prelast = String(row.new_val.type);
            }
            else if (row.new_val.outcome > 0) {
              mclass = "event-win";
              resultstr = "win";
            }
            else {
              resultstr = "lost";
              mclass = "event-loss";
            }

            money = money.replace('-', '');

            TradesDB.insert({
              money: money,
              mclass: mclass,
              curr: curr,
              resultstr: resultstr,
              final: final,
              name: name,
              mid: mid,
              cm: cm
            });
          });
        });
        //self.added('trades', String(i), out);
      }));
    });

    self.ready();
    return (TradesDB.find({mid: mid}));
  });

  Meteor.methods({

    getTrades: function () {
      let out = Trades.count().run();
      return (out);
    }
  });
}
