import {Template} from 'meteor/templating';

import './main.html';

Session.setDefault('nbConnected', 0);
Session.setDefault('nbSignup', 0);
Session.setDefault('nbAffiliation', 0);
Session.setDefault('cg', 0);
Session.setDefault('listCandle', []);
Session.setDefault('nbCandleMax', 600);
Session.setDefault('listTrades', []);
Session.setDefault('chartTrades', []);

let mid = String(Math.floor((Math.random() * 1000) + 1));

Meteor.subscribe('trades', mid);
Meteor.subscribe('candles');

Template.opt_button.helpers({
  GETnbCandleMax: function () {
    let tmp = Session.get('nbCandleMax');

    if (tmp <= 60) {
      return (String(tmp) + 's');
    }
    else {
      return (String(Math.round(tmp / 60, 0)) + 'm');
    }
  }
});

Template.opt_button.events({
  'click .m2': function () {
    let tmp = Session.get('nbCandleMax') - 600;
    if (tmp <= 0) {
      tmp = 10;
    }
    Session.set('nbCandleMax', tmp);
  },
  'click .m1': function () {
    let tmp = Session.get('nbCandleMax') - 120;
    if (tmp <= 0) {
      tmp = 10;
    }
    Session.set('nbCandleMax', tmp);
  },
  'click .m10': function () {
    let tmp = Session.get('nbCandleMax') - 10;
    if (tmp <= 0) {
      tmp = 10;
    }
    Session.set('nbCandleMax', tmp);
  },
  'click .p10': function () {
    let tmp = Session.get('nbCandleMax') + 10;
    Session.set('nbCandleMax', tmp);
  },
  'click .p1': function () {
    let tmp = Session.get('nbCandleMax') + 120;
    Session.set('nbCandleMax', tmp);
  },
  'click .p2': function () {
    let tmp = Session.get('nbCandleMax') + 600;
    Session.set('nbCandleMax', tmp);
  }
});


Template.top_header.helpers({
  nbConnected: function () {
    return Session.get('nbConnected');
  },

  nbSignup: function () {
    Meteor.call('getTrades', function (error, result) {
      Session.set('nbSignup', result);
    });
    return Session.get('nbSignup');
  },

  nbAffiliation: function () {
    return Session.get('nbAffiliation');
  }
});

Template.trade_events.helpers({

  getElems: function () {
    //tmp = tmp.slice() TODO
//    drawMChart(1);
    return Session.get('listTrades');
  }
})


/*function setSessionCandle() {
  let i = 0;
  let out = [];

  while (i < Session.get('nbCandleMax')) {
    out.push(0);
    i = i + 1;
  }
  Session.set('listCandle', out);
}*/

function drawMChart(arg) {
  let d = new Date();
  let cm = 60 + d.getMinutes();
  let i = 0;



  aLabel = []

  while (i < Session.get('nbCandleMax')) {
    aLabel.push("");
    i = i + 1;
  }

  aSerie = Session.get('listCandle');
  //aSerie = aSerie;

  let tmp =  aSerie;
  max = Math.max(...tmp);
  max = max + (max / 20);
  if (max <= 0) {
     max = 5;
  }

  i = 0;
  min = 999999;
  while (i < Session.get('nbCandleMax')){
    if (aSerie[i] < min && aSerie[i] > 0) {
      min = aSerie[i];
    }
    i = i + 1;
  }

  if (min == 999999 || min == 0){
    min = 0;
  }
  else {
    min = min - (min / 10);
  }

  var data = {
    labels: aLabel,
    series: [
        aSerie,
        Session.get('chartTrades')
    ]
  };

  var options = {
    /*    showArea: true,
     height: '100%',
     axisY: {
     onlyInteger: true,
     showGrid: false*/

    high: max,
    low: min,
    showPoint: false,
    showLine: false,
    showArea: true,
    fullWidth: true,
    showLabel: false,
    axisX: {
      showGrid: false,
      showLabel: false,
      offset: 0
    },
    axisY: {
      showGrid: false,
      showLabel: false,
      offset: 0
    },
    chartPadding: 0,
  };

  if (arg == 0) {
    mChart = new Chartist.Line('.ct-chart', data, options);
    Session.set('cg', 1);
  }
  else if (Session.get('cg') > 0 && arg == 1 && mChart) {
    mChart.update(data, options);
  }
}

function updateCandleVal() {
  let max = Session.get('nbCandleMax');
  let retCandle = CandlesDB.find({curr: "EUR/USD"}, {val: 1, _id:0}).fetch().reverse().slice(0, max).reverse();
  let sessCandle = retCandle.map(function(b) {return b.val;});
  Session.set('listCandle', sessCandle);
  let retTrade = TradesDB.find().fetch();
  let sessTrade = retTrade.slice(retTrade.length - 5).reverse();
  Session.set('listTrades', sessTrade);
  let tmpTrade = retTrade.reverse().slice(0, max).reverse();
  let TradeTIME = tmpTrade.map(function(c) {return c.curTime});
  let i = 0;
  let out = [];

  while (i < max){
    let search = retCandle[i].curTime;
    let count = TradeTIME.reduce(function(n, val) {
       return n + (val == search);
     }, 0);
    if (count == 0) {
      out.push(null);
    }
    else {
      out.push(retCandle[i].val);
    }
    i = i + 1;
  }

  console.log(out);
  Session.set('chartTrades', out);
  drawMChart(1);
}

document.addEventListener('DOMContentLoaded', function () {
  drawMChart(0);
  setInterval(updateCandleVal, 200);
});
