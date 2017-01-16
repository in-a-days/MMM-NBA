/* Magic Mirror
 * Module: MMM-NBA
 *
 * Originally MMM-NBA by fewieden https://github.com/fewieden/MMM-NFL
 * Modified by in-a-days https://github.com/in-a-days/MMM-NBA
 * MIT Licensed.
 */

const request = require('request');
const parser = require('xml2js').parseString;
const moment = require('moment-timezone');
const StatisticsAPI = require("./StatisticsAPI.js");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    scores: [],
    details: {},
    nextMatch: null,
    live: {
        state: false,
        matches: []
    },

    start: function() {
        console.log("Starting module: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if(notification === 'CONFIG'){
            this.config = payload;
            this.getData();
            setInterval(() => {
                this.getData();
            }, this.config.reloadInterval);
            setInterval(() => {
                this.fetchOnLiveState();
            }, 60*1000);
        }
    },

    getData: function() {
        request({url: this.urls[this.mode]}, (error, response, body) => {
            if (response.statusCode === 200) {
                parser(body, (err, result) => {
                    if(err) {
                        console.log(err);
                    } else if(result.hasOwnProperty('ss')){
                        this.scores = result.ss.gms[0].g;
                        this.details = result.ss.gms[0].$;
                        this.setMode();
                        this.sendSocketNotification("SCORES", {scores: this.scores, details: this.details});
                        return;
                    } else {
                        console.log("Error no NFL data");
                    }
                });
            } else {
                console.log("Error getting NFL scores " + response.statusCode);
            }
        });
    },

    fetchOnLiveState: function(){
        if(this.live.state === true){
            this.getData();
        }
    }
});
