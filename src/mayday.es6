import * as teamRed from "./teamOne";
import * as teamBlue from "./teamTwo";


function initialize() {
	let globalState = globalInit();

	let redState = teamRed.initState(globalState);
	let blueState = teamBlue.initState(globalState);

	return globalState, redState, blueState;
}

function run(globalState, redState, blueState, dt=0.1) {
	for (let i = 0; i < 10; i++) {
		console.log("Timestep", i);
		let redCommands = teamRed.getCommands();
		let blueCommands = teamBlue.getCommands();

		applyCommands(globalState, redCommands);
		applyCommands(globalState, blueCommands);

		globalState = updateState(globalState, dt);
	}
}

function applyCommands(globalState, commands) {

}

function updateState(globalState, dt) {
	let newState = globalState;
	return newState;
}

function globalInit() {
	 return {
		"data": "stuff"
	};
}

run(initialize());
