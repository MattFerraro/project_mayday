"use strict"
var utils = require("./utils.js");

var state = {};
var color;

exports.initState = function(globalState, givenColor) {
    console.log("Team live initializing state!");
    color = givenColor;
}

exports.getCommands = function(globalState, dt) {
    let commands = [];
    let gps = navigator.getGamepads();
    let still = false;
    if (gps[0] != null) {
        if (typeof(gps[0]) !== 'undefined') {
            let throttle = ((-gps[0].axes[6]) + 1) / 2;
            commands.push({
                id: 0,
                input: "thrust",
                value: throttle
            });

            let elevator = gps[0].axes[1];
            // if (still) { elevator = 0; }
            commands.push({
                id: 0,
                input: "elevator",
                value: elevator
            });

            let aileron = gps[0].axes[0];
            if (still) { aileron = 0; }
            commands.push({
                id: 0,
                input: "aileron",
                value: aileron
            });

            let rudder = gps[0].axes[5];
            if (still) { rudder = 0; }
            commands.push({
                id: 0,
                input: "rudder",
                value: -rudder
            });
        }

    }

    return commands;
}
