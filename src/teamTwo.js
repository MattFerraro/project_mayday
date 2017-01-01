"use strict"
var state = {};
var color = "none";

exports.initState = function(globalState, givenColor) {
	console.log("Team two initializing state!");
	color = givenColor;
}

exports.getCommands = function(globalState, dt) {
	// are we not yet at full thrust?
	let f1Commands = {};
	let commands = [f1Commands];

	if (globalState[color][0].thrust != 1) {
		console.log("Applying full thrust");
		f1Commands.thrust = 1;
	}

	return commands;
}
