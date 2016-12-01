import {Meteor} from 'meteor/meteor';

Meteor.startup(() => {
  Meteor.setInterval(getCandlesFurl, 1000);
  getTrades();
  //Code to run at Startup
});
