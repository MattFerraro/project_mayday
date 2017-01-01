var state = {};

exports.initState = function(globalState) {
	console.log("Team two initializing state!");
	state.hi = 7;
}

exports.getCommands = function(globalState, dt) {
	return [];
}

