import {Template} from 'meteor/templating';

import './main.html';

Session.setDefault('nbConnected', 0);
Session.setDefault('nbSignup', 0);
Session.setDefault('nbAffiliation', 0);
Session.setDefault('cg', 0);

let mid = String(Math.floor((Math.random() * 1000) + 1));

  Meteor.subscribe('trades', mid);

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
    let tmp = TradesDB.find().fetch().reverse();
    drawMChart(1);
    return tmp;
  }
})


function drawMChart(arg) {
  let d = new Date();
  let cm = 60 + d.getMinutes();
  aLabel = [(cm - 10) % 60, (cm - 9) % 60, (cm - 8) % 60, (cm - 7) % 60, (cm - 6) % 60, (cm - 5) % 60, (cm - 4) % 60, (cm - 3) % 60, (cm - 2) % 60, (cm - 1) % 60, cm % 60];
  aSerie = [];

  let i = 10;
  cm = ~~(new Date().valueOf() / 60000)
  while (i >= 0) {
    let tmp = TradesDB.find({cm: (cm - i), mid: mid}).count();
    aSerie.push(tmp);
    i = i - 1;
  }
  max = Math.max(...aSerie) * 2;
  if (max <= 0) {
    max = 5;
  }

  var data = {
    labels: aLabel,
    series: [
      aSerie
    ]
  };

  var options = {
    showArea: true,
    low: 0,
    high: max,
    height: '100%',
    axisY: {
      onlyInteger: true
    },
  };

  if (arg == 0) {
    mChart = new Chartist.Line('.ct-chart', data, options);
    Session.set('cg', 1);
  }
  else if (Session.get('cg') > 0 && arg == 1) {
    mChart.update(data, options);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  drawMChart(0);
});
