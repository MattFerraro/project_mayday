var utils = require('./utils.js');
var planeSpecs = require('./specs.js');
var physics = require("./physics.es6");
var logging = require("./logging.es6");
var _ = require('lodash');
var THREE = require('three');
var Vector3 = THREE.Vector3;

var G = -9.8;   // m/s^2
var rho = 1.2;  // kg/m^3

var verbose = false;

var teamRed = 0;
var teamBlue = 0;
var t = 0;

function initialize(red, blue) {
	teamRed = red;
	teamBlue = blue;
	let globalState = globalInit();
	teamRed.initState(globalState, "red");
	teamBlue.initState(globalState, "blue");
	return globalState;
}

function run(globalState, timesteps, dt=0.05, logLevel=0) {
	for (let i = 0; i < timesteps; i++) {
		step(globalState, dt, logLevel);
	}
}

function step(globalState, dt, logLevel, method="rk4") {
	let redCommands = teamRed.getCommands(globalState, dt);
	let blueCommands = teamBlue.getCommands(globalState, dt);

	applyCommands(globalState, redCommands, "red");
	applyCommands(globalState, blueCommands, "blue");

	globalState = updateState(globalState, dt, t, logLevel, method);
	t += dt;
}

function applyCommands(globalState, commands, color) {
	let planesById = {};
	for (let i = 0; i < globalState[color].length; i++) {
		let plane = globalState[color][i];
		planesById[plane.id] = plane;
	}

	for (let i = 0; i < commands.length; i++) {
		let command = commands[i];
		let plane = planesById[commands[i].id];
		plane[command.input] = command.value;
	}
}
var minAoa = 10;
function updateState(globalState, dt, t, logLevel, method) {
	let newState = _.clone(globalState);
	let teams = [newState.red, newState.blue];

	for (let team of teams) {
		for (let plane of team) {
			let specs = planeSpecs.planeSpecs[plane.type];

			if (method == "euler") {
				let changeInAngularMomentum, deltaRotation, deltaPosition, deltaVelocity;
				[changeInAngularMomentum, deltaRotation, deltaPosition, deltaVelocity] = physics.updatedPlaneState(plane, specs, dt, method);

				plane.angularMomentum.add(changeInAngularMomentum);
				plane.position.add(deltaPosition);
				plane.velocity.add(deltaVelocity);
			    plane.rotation.set(
			    	plane.rotation.x + deltaRotation.x,
					plane.rotation.y + deltaRotation.y,
					plane.rotation.z + deltaRotation.z,
					plane.rotation.w + deltaRotation.w
			    ).normalize();
			}
			else if (method == "rk4") {
				let orig_am = plane.angularMomentum.clone();
				let orig_rot = plane.rotation.clone();
				let orig_pos = plane.position.clone();
				let orig_vel = plane.velocity.clone();

				let k1_a, k1_b, k1_c, k1_d;
				[k1_a, k1_b, k1_c, k1_d] = physics.updatedPlaneState(plane, specs, dt, method);

				plane.angularMomentum.add(k1_a);
				plane.position.add(k1_c);
				plane.velocity.add(k1_d);
			    plane.rotation.set(
			    	plane.rotation.x + k1_b.x,
					plane.rotation.y + k1_b.y,
					plane.rotation.z + k1_b.z,
					plane.rotation.w + k1_b.w
			    ).normalize();
			}

			if (logLevel > 1) {
				logging.logPlane(plane, specs, t);
			}

		}
	}
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
	// var angle = 0 * Math.PI / 180;
	// let x = Math.cos(angle);
	// let y = Math.sin(angle);
	state.blue = [
		{
			type: "fighter",
			id: 0,
			position: new THREE.Vector3(0, -8000, 1.0),
			rightWing: new THREE.Vector3(1, 0, 0),
			heading: new THREE.Vector3(0, 1, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			rotation: new THREE.Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0),
			angularMomentum: new Vector3(0, 0, 0),
			thrust: 0,
			elevator: 0,
			rudder: 0,
			aileron: 0,
			health: 1,
			bullets: 1000
		}
	];
	state.red = [];

	return state;
}

module.exports = {
	run: run,
	initialize: initialize,
	step: step
};

// run(initialize());
