import {Meteor} from 'meteor/meteor';

getCandlesFurl = function () {
  HTTP.call('GET', 'http://webrates.truefx.com/rates/connect.html', {
        params: {
          "c": "EUR/USD"
        }
      },
      function (error, response) {
        if (error) {
          console.log(error);
        } else {
          let value = response.content.substring(7, 15) * 10000 % 10;
          let curTime = Math.round(+new Date() / 1000);

          CandlesDB.insert({
            curr: "EUR/USD",
            curTime: curTime,
            val: value,
            type: null
          });

          let count = CandlesDB.find().count();
          console.log(count);
          if (count > 10000) {
            let max = count - 10000;
            CandlesDB.find({}, {limit: max})
                .map(function(doc) {
                  console.log(doc._id);
                  CandlesDB.remove({_id: doc._id});
                });
          }
        }
      }
  );
};

getTrades = function () {
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
          let type = row.new_val.type;
          let curTime = Math.round(+new Date() / 1000);


          if (row.new_val.outcome == null) {
            mclass = "event-bet";
            money = String(row.new_val.amount);
            final = " on " + row.new_val.type;
          }
          else if (row.new_val.outcome > 0) {
            mclass = "event-win";
            resultstr = "win";
            type = null;
          }
          else {
            resultstr = "lost";
            mclass = "event-loss";
            type = null;
          }

          money = money.replace('-', '');
          TradesDB.insert({
            money: money,
            mclass: mclass,
            curr: curr,
            resultstr: resultstr,
            final: final,
            name: name,
            cm: cm,
            curTime: curTime,
            type: type
          });

          let count = TradesDB.find().count();
          console.log(count);
          if (count > 10000) {
            let max = count - 10000;
            TradesDB.find({}, {limit: max})
                .map(function(doc) {
                  console.log(doc._id);
                  TradesDB.remove({_id: doc._id});
                });
          }

          if (row.new_val.outcome == null) {
            Meteor.setTimeout(function () {
              CandlesDB.update(
                  {curTime: curTime},
                  {
                    $set: {
                      curr: "EUR/USD",
                      type: row.new_val.type,
                    }
                  });
            }, 1000);
          }
        });
      });
    }));
  });
}
