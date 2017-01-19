/* Magic Mirror
 * Module: MMM-NBA
 *
 * Originally MMM-NFL by fewieden https://github.com/fewieden/MMM-NFL
 * Modified by in-a-days https://github.com/in-a-days/MMM-NBA
 * MIT Licensed.
 */

const request = require('request');
const parser = require('xml2js').parseString;
const NodeHelper = require("node_helper");
var PythonShell = require('python-shell');
var pythonStarted = false

module.exports = NodeHelper.create({

    var PythonShell = require('python-shell');

    PythonShell.run('MMM-NBA.py', function (err) {
        if (err) throw err;
    console.log('finished');
    });
    
  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if(notification === 'NBACONFIG') {
      this.config = payload
      if(!pythonStarted) {
        pythonStarted = true;
        this.python_start();
        };
    };
    if(notification === 'NBALOADED') {
        this.config = payload
        self.sendSocketNotification("NBASCORES", this.config);
    };
 }
});
