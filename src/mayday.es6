import * as teamRed from "./teamOne";
import * as teamBlue from "./teamTwo";


function initialize() {
	let globalState = globalInit();

	teamRed.initState(globalState, "red");
	teamBlue.initState(globalState, "blue");

	return globalState;
}

function run(globalState, dt=0.1) {

	for (let i = 0; i < 10; i++) {
		console.log("Timestep", i);
		let redCommands = teamRed.getCommands(globalState, dt);
		let blueCommands = teamBlue.getCommands(globalState, dt);

		applyCommands(globalState, redCommands, "red");
		applyCommands(globalState, blueCommands, "blue");

		globalState = updateState(globalState, dt);
	}
}

function applyCommands(globalState, commands, color) {
	// commands are to be zipped with airplanes before they can be applied
	for (let command of commands) {
		console.log("Command:", command);
	}
}

function updateState(globalState, dt) {
	let newState = globalState;
	return newState;
}

function globalInit() {
	/*
		Orientation:

		+---------------+ max X, max Y
		|				|
		|		R		|
		|				|
		|				|
		|				|
		|				|
		|				|
		|		B		|
		|				|
		+---------------+ max X, min Y


		 Y
		 ^
		 |
		 |
		 |
		 |
		 +------->X
		/
	   Z

	 */

	let state = {};
	state.constants = {
		minX: -10000,
		maxX: 10000,
		minY: -10000,
		maxY: 10000,
		minZ: 0,
		maxZ: 10,
		blueBaseLocation: {
			x: 0,
			y: -8000
		},
		redBaseLocation: {
			x: 0,
			y: 8000
		}
	};
	state.blue = [
		{
			type: "fighter",
			x: 0,
			y: -8000,
			z: 0,
			headingX: 0,
			headingY: 1,
			headingZ: 0,
			dx: 0,
			dy: 0,
			dz: 0,
			thrust: 0,
			elevator: 0,
			rudder: 0,
			aileron: 0,
			mass: 1000,
			health: 1,
			bullets: 1000
		}
	];

	return state;
}

run(initialize());
