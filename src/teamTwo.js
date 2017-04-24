"use strict"
var utils = require("./utils.js");

var state = {};
var color = "none";
var applied = false;
var count = 0;
var time = 0;
var trigger0 = false;
var trigger1 = false;

exports.initState = function(globalState, givenColor) {
	console.log("Team two initializing state!");
	color = givenColor;
}

exports.getCommands = function(globalState, dt) {
	let commands = [];
	count+=1;
	time += dt;
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
				value: .4
			});

			commands.push({
				id: plane.id,
				input: "elevator",
				value: 0 //pull up somewhat
			});

			applied = true;
		}

		// if (time > 3 && trigger0 === false) {
		// 	commands.push({
		// 		id: plane.id,
		// 		input: "rudder",
		// 		value: 0.5
		// 	});
		// 	trigger0 = true;
		// }

		// if (time > 5 && trigger1 === false) {
		// 	commands.push({
		// 		id: plane.id,
		// 		input: "rudder",
		// 		value: 0
		// 	});
		// 	trigger1 = true;
		// }

		if (plane.position.z > 50 && !pushedDown) {
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
