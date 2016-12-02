import {Meteor} from 'meteor/meteor';

getCandlesFurl = function() {
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
          let curTime = Math.round(+ new Date() / 1000);

          CandlesDB.insert({
            val: value,
            curr: "EUR/USD",
            curTime: curTime
          });
        }
      }
  );
};

getTrades = function() {
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
          let curTime = Math.round(+ new Date() / 1000);

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
        });
      });
    }));
  });
}