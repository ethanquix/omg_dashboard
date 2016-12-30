if (Meteor.isServer) {
  Trades = new Rethink.Table('trade');
  Users = new Rethink.Table('user');

  Meteor.publish('trades', function () {
    this.ready();
      return (TradesDB.find());
  });


  Meteor.publish('candles', function () {
    this.ready();
      return (CandlesDB.find());
  });

  Meteor.methods({

    getTrades: function () {
      let out = Trades.count().run();
      return (out);
    }
  });
}
