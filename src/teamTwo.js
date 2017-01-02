"use strict"
var utils = require("./utils.js");
var winston = require('winston');

var state = {};
var color = "none";
var applied = false;

exports.initState = function(globalState, givenColor) {
	console.log("Team two initializing state!");
	color = givenColor;
}

exports.getCommands = function(globalState, dt) {
	let commands = [];

	// for each plane, create some commands
	for (var i = globalState[color].length - 1; i >= 0; i--) {
		let plane = globalState[color][i];

		// are we not yet at full thrust?

		if (plane.thrust != 1 && applied === false) {
			winston.info("team: Applying full thrust");
			commands.push({
				id: plane.id,
				input: "thrust",
				value: 1
			});
			applied = true;
		}

		// Do we have some altitude? If so cut engine
		if (plane.z > 2) {
			winston.info("team: cutting throttle");
			commands.push({
				id: plane.id,
				input: "thrust",
				value: 0
			});
		}
	}

	return commands;
}
