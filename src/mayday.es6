import * as utils from "./utils";
import * as teamRed from "./teamOne";
import * as teamBlue from "./teamTwo";
var planeSpecs = require('./specs.js');

var _ = require('lodash');
var winston = require('winston');
winston.level = "info";

var G = -9.8;   // m/s^2
var rho = 1.2;  // kg/m^3


var LOGLEVEL = 5;
var TIMESTEPS = 20 * 36;

function initialize() {
	let globalState = globalInit();

	teamRed.initState(globalState, "red");
	teamBlue.initState(globalState, "blue");

	return globalState;
}

function run(globalState, dt=0.05) {

	for (let i = 0; i < TIMESTEPS; i++) {
		winston.info("Timestep", i);
		let redCommands = teamRed.getCommands(globalState, dt);
		let blueCommands = teamBlue.getCommands(globalState, dt);

		applyCommands(globalState, redCommands, "red");
		applyCommands(globalState, blueCommands, "blue");

		globalState = updateState(globalState, dt);
	}
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

function updateState(globalState, dt) {
	let newState = _.clone(globalState);
	let teams = [newState.red, newState.blue];
	for (let team of teams) {
		for (let plane of team) {
			let specs = planeSpecs.planeSpecs[plane.type];

			// USEFUL VECTORS AND VALUES ************
			let heading = [plane.headingX, plane.headingY, plane.headingZ];
			let up = [plane.upX, plane.upY, plane.upZ];

			// velocity vector is a little more tricky if we
			// want to calculate angle of attack
			let velocityNorm = [];
			if (plane.dx !== 0 || plane.dy !== 0 || plane.dz !== 0) {
				// if we have a meaningful velocity
				velocityNorm = utils.normalize([plane.dx, plane.dy, plane.dz]);
			}
			else {
				// if we are still, we use velocity = heading
				velocityNorm = [heading[0], heading[1], heading[2]];
			}

			// find angle of attack, cl and cd
			let firstCross = utils.cross(heading, velocityNorm);
			let secondCross = utils.cross(firstCross, up);
			let c = utils.dot(heading, secondCross);
			let aoa = Math.asin(c) * 180 / Math.PI; // in degrees
			let cl = specs.cl(aoa);
			let cd = specs.cd(aoa);

			let velocity = [plane.dx, plane.dy, plane.dz];

			// Project velocity onto heading
			let velocityOnHeading = utils.scale(velocity, utils.dot(velocity, heading));

			// FORCES ******************************
			// gravity pulls you down
			let Fgrav = [0, 0, G * specs.mass];
			let FgravMag = utils.mag(Fgrav);
			winston.debug("F grav:", Fgrav);

			// lift scales with v^2
			let speedSquared =
				velocityOnHeading[0] * velocityOnHeading[0] +
				velocityOnHeading[1] * velocityOnHeading[1] +
				velocityOnHeading[2] * velocityOnHeading[2];



			let FliftMag = 0.5 * rho * cl * specs.wingArea * speedSquared;
			// lift pulls you up
			let Flift = utils.scale(up, FliftMag);
			winston.debug("F lift:", Flift);

			// thrust pushes you forward
			let FthrustMag = plane.thrust * specs.maxThrust;
			let Fthrust = utils.scale(heading, FthrustMag);
			winston.debug("F thrust:", Fthrust);

			// drag pulls you back
			let FdragMag = 0.5 * rho * cd * specs.frontalArea * speedSquared;
			let Fdrag = utils.scale(heading, -FdragMag);
			winston.debug("F drag:", Fdrag);

			let Fnet = utils.plus(utils.plus(utils.plus(Fgrav, Flift), Fdrag), Fthrust);

			winston.debug("F net:", Fnet);

			// if near the ground, the landing gear pushes you up
			if (plane.z <= 1) {
				let k = 30 * specs.mass;
				let compression = 1 - plane.z;
				let k2 = 2000;
				let Fspring = utils.scale([0, 0, 1], compression * k - plane.dz * Math.abs(k2));
				winston.debug("F spring:", Fspring);

				Fnet = utils.plus(Fnet, Fspring);
				winston.debug("F net:", Fnet);
			}

			// KINEMATICS ******************************
			let accel = utils.scale(Fnet, 1/specs.mass);

			plane.dx += accel[0] * dt;
			plane.dy += accel[1] * dt;
			plane.dz += accel[2] * dt;

			plane.x += 0.5 * accel[0] * dt * dt + plane.dx * dt;
			plane.y += 0.5 * accel[0] * dt * dt + plane.dy * dt;
			plane.z += 0.5 * accel[0] * dt * dt + plane.dz * dt;

			/*
				0: index
				1: x
				2: y
				3: z
				4: dx
				5: dy
				6: dz
				7: accel.x
				8: accel.y
				9: accel.z
				10: flift.x
				11: flift.y
				12: flift.z
				13: aoa
				14: cl
				15: cd
				16: fdrag.x
				17: fdrag.y
				18: fdrag.z
				19: fthrust.x
				20: fthrust.y
				21: fthrust.z
			 */

			// location, velocity, force_lift
			winston.info("plane:\t" +
				plane.x + "\t" + plane.y + "\t" + plane.z + "\t" +
				plane.dx + "\t" + plane.dy + "\t" + plane.dz + "\t" +
				accel[0] + "\t" + accel[1] + "\t" + accel[2] + "\t" +
				Flift[0] + "\t" + Flift[1] + "\t" + Flift[2] + "\t" +
				aoa + "\t" + cl + "\t" + cd + "\t" +
				Fdrag[0] + "\t" + Fdrag[1] + "\t" + Fdrag[2] + "\t" +
				Fthrust[0] + "\t" + Fthrust[1] + "\t" + Fthrust[2] + "\t"
			);
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
	state.blue = [
		{
			type: "fighter",
			id: 0,
			x: 0,
			y: -8000,
			z: 0.674932,
			headingX: 0,
			headingY: 1,
			headingZ: 0,
			upX: 0,
			upY: 0,
			upZ: 1,
			dx: 0,
			dy: 0,
			dz: 0,
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

run(initialize());
