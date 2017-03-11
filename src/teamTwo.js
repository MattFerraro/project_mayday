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

		if (plane.thrust != 1 && applied === false) {
			console.log("team: Applying full thrust");
			commands.push({
				id: plane.id,
				input: "thrust",
				value: 0
			});
			applied = true;
		}

		// Do we have some altitude? If so push down
		if (plane.z > 3 && plane.elevator === 0) {
			console.log("team: pulling up");
			commands.push({
				id: plane.id,
				input: "elevator",
				value: -0.01
			});
		}

		// Do we have lots of altitude? If so stop!
		// if (plane.z > 4 && plane.elevator !== 0) {
		// 	console.log("team: stopping!");
		// 	commands.push({
		// 		id: plane.id,
		// 		input: "elevator",
		// 		value: 0
		// 	});
		// }
	}

	return commands;
}
