"use strict"
var utils = require("./utils.js");

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

		let elev = 0;
		if (plane.thrust != 1 && applied === false) {
			console.log("team: Applying full thrust");
			commands.push({
				id: plane.id,
				input: "thrust",
				value: 1
			});

			commands.push({
				id: plane.id,
				input: "elevator",
				value: elev //pull up slightly
			});
			console.log("elev", elev)
			applied = true;
		}

	}
	return commands;
}
