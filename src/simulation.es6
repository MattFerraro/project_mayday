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

function run(globalState, timesteps, dt=0.05, logLevel=0, method) {
	for (let i = 0; i < timesteps; i++) {
		step(globalState, dt, logLevel, method);
	}
}

function step(globalState, dt, logLevel, method) {
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
			else if (method == "verlet") {
				let orig_am = plane.angularMomentum.clone();
				let orig_rot = plane.rotation.clone();
				let orig_pos = plane.position.clone();
				let orig_vel = plane.velocity.clone();

				let changeInAngularMomentum0, deltaRotation0, deltaPosition0, deltaVelocity0;
				[changeInAngularMomentum0, deltaRotation0, deltaPosition0, deltaVelocity0] = physics.updatedPlaneState(plane, specs, dt, method);

				// Step forward
				plane.angularMomentum.add(changeInAngularMomentum0);
				plane.position.add(deltaPosition0);
				plane.velocity.add(deltaVelocity0);
			    plane.rotation.set(
			    	plane.rotation.x + deltaRotation0.x,
					plane.rotation.y + deltaRotation0.y,
					plane.rotation.z + deltaRotation0.z,
					plane.rotation.w + deltaRotation0.w
			    ).normalize();

			    // Calculate derivatives at the next timestep
			    let changeInAngularMomentum1, deltaRotation1, deltaPosition1, deltaVelocity1;
				[changeInAngularMomentum1, deltaRotation1, deltaPosition1, deltaVelocity1] = physics.updatedPlaneState(plane, specs, dt, method);

				// Average both estimates of the derivative
				let changeInAngularMomentumAvg = (changeInAngularMomentum0.clone().add(changeInAngularMomentum1)).multiplyScalar(.5);
				// let deltaRotationAvg = (deltaRotation0.clone().add(deltaRotation1)).multiplyScalar(.5);
				let deltaRotationAvg = deltaRotation0.clone().slerp(deltaRotation1, 0.5);
				let deltaPositionAvg = (deltaPosition0.clone().add(deltaPosition1)).multiplyScalar(.5);
				let deltaVelocityAvg = (deltaVelocity0.clone().add(deltaVelocity1)).multiplyScalar(.5);

				// console.log("CHANGES AVGD", changeInAngularMomentumAvg)

				// Reset to our original values
				plane.angularMomentum.copy(orig_am);
				plane.rotation.copy(orig_rot);
				plane.position.copy(orig_pos);
				plane.velocity.copy(orig_vel);

				// Step forward with the averaged estimates of derivative
				plane.angularMomentum.add(changeInAngularMomentumAvg);
				plane.position.add(deltaPositionAvg);
				plane.velocity.add(deltaVelocityAvg);
			    plane.rotation.set(
			    	plane.rotation.x + deltaRotationAvg.x,
					plane.rotation.y + deltaRotationAvg.y,
					plane.rotation.z + deltaRotationAvg.z,
					plane.rotation.w + deltaRotationAvg.w
			    ).normalize();
			}
			else if (method == "rk4") {
				// Right now this is just a clone of trapezoidal integration...
				// How would I meaningfully take the weighted average of 4
				// different quaternions?
				let orig_am = plane.angularMomentum.clone();
				let orig_rot = plane.rotation.clone();
				let orig_pos = plane.position.clone();
				let orig_vel = plane.velocity.clone();

				let dam0, dr0, dp0, dv0;
				[dam0, dr0, dp0, dv0] = physics.updatedPlaneState(plane, specs, dt, method);

				// Step forward
				plane.angularMomentum.add(dam0);
				plane.position.add(dp0);
				plane.velocity.add(dv0);
			    plane.rotation.set(
			    	plane.rotation.x + dr0.x,
					plane.rotation.y + dr0.y,
					plane.rotation.z + dr0.z,
					plane.rotation.w + dr0.w
			    ).normalize();

			    // Calculate derivatives at the next timestep
			    let dam1, dr1, dp1, dv1;
				[dam1, dr1, dp1, dv1] = physics.updatedPlaneState(plane, specs, dt, method);

				// Average both estimates of the derivative
				let damAvg = (dam0.clone().add(dam1)).multiplyScalar(.5);
				// let deltaRotationAvg = (dr0.clone().add(dr1)).multiplyScalar(.5);
				let drAvg = dr0.clone().slerp(dr1, 0.5);
				let dpAvg = (dp0.clone().add(dp1)).multiplyScalar(.5);
				let dvAvg = (dv0.clone().add(dv1)).multiplyScalar(.5);

				// console.log("CHANGES AVGD", damAvg)

				// Reset to our original values
				plane.angularMomentum.copy(orig_am);
				plane.rotation.copy(orig_rot);
				plane.position.copy(orig_pos);
				plane.velocity.copy(orig_vel);

				// Step forward with the averaged estimates of derivative
				plane.angularMomentum.add(damAvg);
				plane.position.add(dpAvg);
				plane.velocity.add(dvAvg);
			    plane.rotation.set(
			    	plane.rotation.x + drAvg.x,
					plane.rotation.y + drAvg.y,
					plane.rotation.z + drAvg.z,
					plane.rotation.w + drAvg.w
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
