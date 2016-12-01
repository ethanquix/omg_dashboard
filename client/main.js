import {Template} from 'meteor/templating';

import './main.html';

Session.setDefault('nbConnected', 0);
Session.setDefault('nbSignup', 0);
Session.setDefault('nbAffiliation', 0);
Session.setDefault('cg', 0);
Session.setDefault('listCandle', []);
Session.setDefault('nbCandleMax', 120);

let mid = String(Math.floor((Math.random() * 1000) + 1));

Meteor.subscribe('trades', mid);

Template.opt_button.helpers({
  GETnbCandleMax: function () {
    return (Session.get('nbCandleMax'));
  }
});

Template.opt_button.events({
  'click .m2': function () {
    let tmp = Session.get('nbCandleMax') - 120;
    if (tmp < 0) {
      tmp = 0;
    }
    Session.set('nbCandleMax', tmp);
  },
  'click .m1': function () {
    let tmp = Session.get('nbCandleMax') - 60;
    if (tmp < 0) {
      tmp = 0;
    }
    Session.set('nbCandleMax', tmp);
  },
  'click .m10': function () {
    let tmp = Session.get('nbCandleMax') - 10;
    if (tmp < 0) {
      tmp = 0;
    }
    Session.set('nbCandleMax', tmp);
  },
  'click .p10': function () {
    let tmp = Session.get('nbCandleMax') + 10;
    Session.set('nbCandleMax', tmp);
  },
  'click .p1': function () {
    let tmp = Session.get('nbCandleMax') + 60;
    Session.set('nbCandleMax', tmp);
  },
  'click .p2': function () {
    let tmp = Session.get('nbCandleMax') + 120;
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
    let tmp = TradesDB.find().fetch();
    tmp = tmp.slice(tmp.length - 5).reverse();
    //   reverse();
    drawMChart(1);
    return tmp;
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

  //aLabel = [(cm - 10) % 60, (cm - 9) % 60, (cm - 8) % 60, (cm - 7) % 60, (cm - 6) % 60, (cm - 5) % 60, (cm - 4) % 60, (cm - 3) % 60, (cm - 2) % 60, (cm - 1) % 60, cm % 60];
  aSerie = Session.get('listCandle');

  aSerie = aSerie.reverse().slice(0, Session.get('nbCandleMax')).reverse();
  // i = 10;
  // cm = ~~(new Date().valueOf() / 60000)
  // while (i >= 0) {
  //   let tmp = TradesDB.find({cm: (cm - i), mid: mid}).count();
  //   aSerie.push(tmp);
  //   i = i - 1;
  // }
  let tmp = aSerie.slice(0, Session.get('nbCandleMax'));
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

  if (min == 999999){
    min = 0;
  }
  else {
    min = min - min % 10;
  }
  var data = {
    labels: aLabel,
    series: [
      aSerie
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
  else if (Session.get('cg') > 0 && arg == 1) {
    mChart.update(data, options);
  }
}

function updateTradeVal() {
  //retrieve trades value;

  HTTP.call('GET', 'http://webrates.truefx.com/rates/connect.html', {
    params: {
      "c": "EUR/JPY"
    }
  }, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      let value = response.content.substring(7, 15) * 10000 % 1000;
      let tmp = Session.get('listCandle');

      tmp.push(value);
      if (tmp.length > Session.get('nbCandleMax')) {
        tmp = tmp.slice(1);
      }
      Session.set('listCandle', tmp);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  drawMChart(0);
  // setSessionCandle();
  setInterval(updateTradeVal, 1000);
});
