"use strict"
var utils = require("./utils.js");

var state = {};
var color = "none";
var applied = false;
var count = 0;

exports.initState = function(globalState, givenColor) {
	console.log("Team two initializing state!");
	color = givenColor;
}

exports.getCommands = function(globalState, dt) {
	let commands = [];
	count+=1;
	// return commands;
	let pushedDown = false;

	// for each plane, create some commands
	for (var i = globalState[color].length - 1; i >= 0; i--) {
		let plane = globalState[color][i];

		// are we not yet at full thrust?
		// let elev = 0;
		if (plane.thrust != 1 && applied === false) {
			console.log("team two: Applying full thrust");
			commands.push({
				id: plane.id,
				input: "thrust",
				value: 1
			});

			commands.push({
				id: plane.id,
				input: "elevator",
				value: .2 //pull up somewhat
			});

			applied = true;
		}

		if (plane.position.z > 40 && !pushedDown) {
			commands.push({
				id: plane.id,
				input: "elevator",
				value: -.4 //push down up aggressively
			});
			pushedDown = true;
		}

	}
	return commands;
}
