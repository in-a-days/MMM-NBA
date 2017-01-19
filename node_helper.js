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
var fromnode = false

module.exports = NodeHelper.create({

  python_start: function () {
    const self = this;
    const pyshell = new PythonShell('modules/' + this.name + '/MMM-NBA.py', { mode: 'json', args: [JSON.stringify(this.config)]});

    pyshell.on('message', function (message) {
  // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
        fromnode = message;
    });

    pyshell.end(function (err) {
        if (err) throw err;
        console.log('finished');
    });
  },
    
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
