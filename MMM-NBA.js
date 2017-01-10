/* Magic Mirror
 * Module: MMM-NBA
 *
 * By fewieden https://github.com/fewieden/MMM-NBA
 * MIT Licensed.
 */

Module.register("MMM-NBA", {

    modes: {
        "P": "Pre-Season",
        "R": "Regular-Season",
        "POST": "Post-Season"
    },

    details: {
        y: (new Date()).getFullYear(),
        t: "P"
    },

    states: {
        "1": "1ST_QUARTER",
        "2": "2ND_QUARTER",
        "3": "3RD_QUARTER",
        "4": "4TH_QUARTER",
        "H": "HALF_TIME",
        "OT": "OVER_TIME",
        "F": "FINAL",
        "FO": "FINAL_OVERTIME",
        "T": "TIE",
        "P": "UPCOMING"
    },

    defaults: {
        colored: false,
        helmets: false,
        focus_on: false,
        format: "ddd h:mm",
        reloadInterval: 30 * 60 * 1000       // every 30 minutes
    },

    statistics: false,
    help: false,

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getScripts: function() {
        return ["moment.js"];
    },

    getStyles: function () {
        return ["font-awesome.css", "MMM-NBA.css"];
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        moment.locale(config.language);
    },

    checkCommands: function(data){
        if(/(HELP)/g.test(data)){
            if(/(CLOSE)/g.test(data) || this.help && !/(OPEN)/g.test(data)){
                this.help = false;
            } else if(/(OPEN)/g.test(data) || !this.help && !/(CLOSE)/g.test(data)){
                this.statistics = false;
                this.help = true;
            }
        } else if(/(HELMETS)/g.test(data)){
            this.config.helmets = true;
        } else if(/(LOGOS)/g.test(data)){
            this.config.helmets = false;
        } else if(/(COLOR)/g.test(data)){
            if(/(OFF)/g.test(data) || this.config.colored && !/(ON)/g.test(data)){
                this.config.colored = false;
            } else if(/(ON)/g.test(data) || !this.config.colored && !/(OFF)/g.test(data)){
                this.config.colored = true;
            }
        }
        this.updateDom(300);
    },

    getDom: function () {

        var wrapper = document.createElement("div");
        var scores = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = "NBA " + this.modes[this.details.t] + " " + this.details.y;
        scores.appendChild(header);

        if (!this.scores) {
            var text = document.createElement("div");
            text.innerHTML = this.translate("LOADING");
            text.classList.add("dimmed", "light");
            scores.appendChild(text);
        } else {
            var table = document.createElement("table");
            table.classList.add("small", "table");

            table.appendChild(this.createLabelRow());

            for (var i = 0; i < this.scores.length; i++) {
                this.appendDataRow(this.scores[i].$, table);
            }

            if(Array.isArray(this.config.focus_on)){
                for(var i = 0; i < this.config.focus_on.length; i++){
                    var hasMatch = false;
                    for(var n = 0; n < this.scores.length; n++) {
                        if(this.config.focus_on[i] === this.scores[n].$.h || this.config.focus_on[i] === this.scores[n].$.v){
                            hasMatch = true;
                            break;
                        }
                    }
                    if(!hasMatch){
                        this.appendByeWeek(this.config.focus_on[i], table);
                    }
                }
            }

            scores.appendChild(table);

            var modules = document.querySelectorAll(".module");
            for (var i = 0; i < modules.length; i++) {
                if(!modules[i].classList.contains("MMM-NBA")){
                    if(this.statistics || this.help){
                        modules[i].classList.add("MMM-NBA-blur");
                    } else {
                        modules[i].classList.remove("MMM-NBA-blur");
                    }
                }
            }

            if(this.statistics || this.help){
                scores.classList.add("MMM-NBA-blur");
                var modal = document.createElement("div");
                modal.classList.add("modal");
                if(this.statistics){
                    this.appendStatistics(modal);
                } else {
                    this.appendHelp(modal);
                }
                wrapper.appendChild(modal);
            }
        }

        wrapper.appendChild(scores);

        return wrapper;
    },

    createLabelRow: function () {
        var labelRow = document.createElement("tr");

        var dateLabel = document.createElement("th");
        var dateIcon = document.createElement("i");
        dateIcon.classList.add("fa", "fa-calendar");
        dateLabel.appendChild(dateIcon);
        labelRow.appendChild(dateLabel);

        var homeLabel = document.createElement("th");
        homeLabel.innerHTML = this.translate("HOME");
        homeLabel.setAttribute("colspan", 3);
        labelRow.appendChild(homeLabel);

        var vsLabel = document.createElement("th");
        vsLabel.innerHTML = "";
        labelRow.appendChild(vsLabel);

        var awayLabel = document.createElement("th");
        awayLabel.innerHTML = this.translate("AWAY");
        awayLabel.setAttribute("colspan", 3);
        labelRow.appendChild(awayLabel);

        return labelRow;
    },

    appendDataRow: function (data, appendTo) {
        if(!this.config.focus_on || this.config.focus_on.indexOf(data.h) !== -1 || this.config.focus_on.indexOf(data.v) !== -1) {
            var row = document.createElement("tr");
            row.classList.add("row");

            var date = document.createElement("td");
            if (data.q in ["1", "2", "3", "4", "H", "OT"]) {
                var quarter = document.createElement("div");
                quarter.innerHTML = this.translate(this.states[data.q]);
                if (data.hasOwnProperty("k")) {
                    quarter.classList.add("live");
                    date.appendChild(quarter);
                    var time = document.createElement("div");
                    time.classList.add("live");
                    time.innerHTML = data.k + ' ' + this.translate('TIME_LEFT');
                    date.appendChild(time);
                } else {
                    date.appendChild(quarter);
                }
            } else if (data.q === "P") {
                date.innerHTML = moment(data.starttime).format(this.config.format);
            } else {
                date.innerHTML = this.translate(this.states[data.q]);
                date.classList.add("dimmed");
            }
            row.appendChild(date);

            var homeTeam = document.createElement("td");
            homeTeam.classList.add("align-right");
            this.appendBallPossession(data, true, homeTeam);
            var homeTeamSpan = document.createElement("span");
            homeTeamSpan.innerHTML = data.h;
            homeTeam.appendChild(homeTeamSpan);
            row.appendChild(homeTeam);

            var homeLogo = document.createElement("td");
            var homeIcon = document.createElement("img");
            homeIcon.src = this.file("icons/" + data.h + (this.config.helmets ? "_helmet" : "") + ".png");
            if (!this.config.colored) {
                homeIcon.classList.add("icon");
            }
            homeLogo.appendChild(homeIcon);
            row.appendChild(homeLogo);

            var homeScore = document.createElement("td");
            homeScore.innerHTML = data.hs;
            row.appendChild(homeScore);

            var vs = document.createElement("td");
            vs.innerHTML = ":";
            row.appendChild(vs);

            var awayScore = document.createElement("td");
            awayScore.innerHTML = data.vs;
            row.appendChild(awayScore);

            var awayLogo = document.createElement("td");
            var awayIcon = document.createElement("img");
            awayIcon.src = this.file("icons/" + data.v + (this.config.helmets ? "_helmet" : "") + ".png");
            if (!this.config.colored) {
                awayIcon.classList.add("icon");
            }
            if (this.config.helmets) {
                awayIcon.classList.add("away");
            }
            awayLogo.appendChild(awayIcon);
            row.appendChild(awayLogo);

            var awayTeam = document.createElement("td");
            awayTeam.classList.add("align-left");
            var awayTeamSpan = document.createElement("span");
            awayTeamSpan.innerHTML = data.v;
            awayTeam.appendChild(awayTeamSpan);
            this.appendBallPossession(data, false, awayTeam);
            row.appendChild(awayTeam);

            appendTo.appendChild(row);
        }
    },
});
