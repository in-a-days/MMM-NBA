/* Magic Mirror
 * Module: MMM-NBA
 *
 * By fewieden https://github.com/fewieden/MMM-NBA
 * MIT Licensed.
 */

Module.register("MMM-NBA", {

    defaults: {
        colored: false,
        format: "ddd h:mm",
        reloadInterval: 5 * 60 * 1000       // every 5 minutes
    },

    getStyles: function () {
        return ["font-awesome.css", "MMM-NBA.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("NBACONFIG", this.config);
        moment.locale(config.language);
    },

    notificationReceived: function(notification, payload){
	    if (notification === 'NBASCORES'){
		    this.config = payload;
	    };
    },    
    
    getDom: function () {

        var wrapper = document.createElement("div");
        var scores = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = "NBA Scores";
	wrapper.innerHTML = "some text";
        return wrapper;
    },
});
