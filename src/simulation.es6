var utils = require('./utils.js');
var planeSpecs = require('./specs.js');
var _ = require('lodash');
var THREE = require('three');
var Vector3 = THREE.Vector3;

var G = -9.8;   // m/s^2
var rho = 1.2;  // kg/m^3

var verbose = false;

var teamRed = 0;
var teamBlue = 0;

function initialize(red, blue) {
	teamRed = red;
	teamBlue = blue;
	let globalState = globalInit();
	teamRed.initState(globalState, "red");
	teamBlue.initState(globalState, "blue");
	return globalState;
}

function run(globalState, timesteps, dt=0.05) {
	for (let i = 0; i < timesteps; i++) {
		console.log("Timestep", i);
		step(globalState, dt);
	}
}

function step(globalState, dt) {
	let redCommands = teamRed.getCommands(globalState, dt);
	let blueCommands = teamBlue.getCommands(globalState, dt);

	applyCommands(globalState, redCommands, "red");
	applyCommands(globalState, blueCommands, "blue");

	globalState = updateState(globalState, dt);
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
function updateState(globalState, dt) {
	let newState = _.clone(globalState);
	let teams = [newState.red, newState.blue];

	for (let team of teams) {
		for (let plane of team) {
			let specs = planeSpecs.planeSpecs[plane.type];

			// USEFUL VECTORS AND VALUES ****************
			let heading = plane.heading.clone().normalize();
			let up = plane.up.clone().normalize();
			let velocity = plane.velocity.clone();

			let liftDirection = up.clone().projectOnPlane(velocity).normalize();
			let pitchAxis = up.clone().cross(heading).normalize();
			let liftVelocity = velocity.clone().projectOnPlane(pitchAxis);
			let velocityOnHeading = velocity.clone().projectOnVector(heading);

			// velocity vector is a little more tricky if we
			// want to calculate angle of attack
			// let velocityNorm = new THREE.Vector3();
			if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {
				// if we have a meaningful velocity
				var velocityNorm = velocity.clone().normalize();
			}
			else {
				// if we are still, we use velocity = heading
				var velocityNorm = heading.clone().normalize();
				console.log("still!");
			}

			// find angle of attack, cl and cd
			let diff = heading.clone().sub(velocityNorm);

			// let aoa = Math.asin(diff.clone().projectOnVector(up).length()) * 180 / Math.PI;
			let aoa = Math.asin(diff.clone().projectOnVector(up).dot(up)) * 180 / Math.PI;
			// project the velocity vector onto the plane described by the up/heading vectors
			let projectedVelocity = velocityNorm.clone().projectOnPlane(pitchAxis);
			// let aoa2 = projectedVelocity.angleTo(heading) * 180 / Math.PI;
			// console.log(aoa, aoa2, aoa - aoa2);
			// if (aoa2 < minAoa) {
			// 	minAoa = aoa2;
			// }
			console.log(aoa);

			// project the velocity vector on to the plane described by the up vector
			// let projectedVelocity2 = velocityNorm.clone().projectOnPlane(up);
			// let rudderAoa = projectedVelocity2.angleTo(heading);
			// let rudderAoa = liftVelocity.angleTo(velocity) * 180 / Math.PI;

			// let aoa = Math.asin(diff.clone().projectOnVector(up).length()) * 180 / Math.PI;
			// let aoa = Math.asin(utils.dot(diff, up)) * 180 / Math.PI;
			// console.log(aoa);
			// console.log(plane.omegaRoll);

			// let rudderUp = up.clone().cross(heading);
			// let rudderUp = utils.cross(up, heading);
			// let rudderAoa = Math.asin(utils.dot(diff, rudderUp)) * 180 / Math.PI;
			let rudderAoa = Math.asin(diff.clone().projectOnVector(pitchAxis).length()) * 180 / Math.PI;

			// let firstCross = utils.cross(heading, velocityNorm);
			// let secondCross = utils.cross(firstCross, up);
			// let c = utils.dot(heading, secondCross);
			// let aoa = Math.asin(c) * 180 / Math.PI; // in degrees
			let cl = specs.cl(aoa);
			let cd = specs.cd(aoa);
			// console.log(cl, cd);


			// Project velocity onto heading
			// let velocityOnHeading = utils.scale(velocity, utils.dot(velocityNorm, heading));
			// If the airplane is crabbing, we get cosine loss of velocity.
			// However if the airplane is pulling up, we get full velocity

			// let liftDirection = velocityNorm.clone().cross(pitchAxis).normalize();

			// console.log(utils.mag(velocity), utils.mag(velocityOnHeading));


			// FORCES **********************************
			// gravity pulls you down
			// let Fgrav = [0, 0, G * specs.mass];
			let Fgrav = new Vector3(0, 0, G * specs.mass);
			// let FgravMag = utils.mag(Fgrav);
			// console.log("F grav:", Fgrav);

			// lift scales with v^2
			// let speedSquared = utils.magSquared(velocityOnHeading);
			// let speedSquared = velocityOnHeading.lengthSq();
			let FliftMag = 0.5 * rho * cl * specs.wingArea * liftVelocity.lengthSq();
			// lift pulls you up
			let Flift = liftDirection.clone().setLength(FliftMag);
			// console.log("F lift:", utils.mag(Flift));

			// thrust pushes you forward
			let FthrustMag = plane.thrust * specs.maxThrust;
			let Fthrust = heading.clone().setLength(FthrustMag);
			// console.log("F thrust:", Fthrust);

			// drag pulls you back
			let FdragMag = 0.5 * rho * cd * specs.frontalArea * velocity.lengthSq();
			//let Fdrag = utils.scale(velocityNorm, -FdragMag);
			let Fdrag = velocityNorm.clone().negate().setLength(FdragMag);
			// console.log("F drag:", Fdrag);

			// let Fnet = utils.plus(utils.plus(utils.plus(Fgrav, Flift), Fdrag), Fthrust);
			let Fnet = Fgrav.clone().add(Flift).add(Fdrag).add(Fthrust);

			// console.log("F net:", Fnet);

			// if near the ground, the landing gear pushes you up
			if (plane.position.z <= 1) {
				let k = specs.mass * 9.8 * 2;
				let compression = 1 - plane.position.z;
				let k2 = 8000;
				let Fspring = new Vector3(0, 0, compression * k - velocity.z * k2);
				// let Fspring = utils.scale([0, 0, 1], compression * k - plane.dz * Math.abs(k2));
				// console.log("F spring:", Fspring);

				Fnet = Fnet.clone().add(Fspring);
				// console.log("F net:", Fnet);
			}


			// LINEAR KINEMATICS ******************************
			// let accel = utils.scale(Fnet, 1/specs.mass);
			let accel = Fnet.clone().divideScalar(specs.mass);

			let deltaVelocity = accel.clone().multiplyScalar(dt);
			plane.velocity.add(deltaVelocity);

			// plane.dx += accel[0] * dt;
			// plane.dy += accel[1] * dt;
			// plane.dz += accel[2] * dt;

			let deltaPosition = accel.clone().multiplyScalar(dt * dt * 0.5).add(velocity.clone().multiplyScalar(dt));
			plane.position.add(deltaPosition);

			// plane.x += 0.5 * accel[0] * dt * dt + plane.dx * dt;
			// plane.y += 0.5 * accel[0] * dt * dt + plane.dy * dt;
			// plane.z += 0.5 * accel[0] * dt * dt + plane.dz * dt;

			// TORQUES ****************************************
			let kPitchFriction = 200;


			// let Tpitch = -0.5 * rho * aoa * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength;
			let Tpitch = 0;
			if (plane.position.z < 1) {
				let pureZ = new Vector3(0, 0, 1);
				let headingOffGround = heading.clone().projectOnVector(pureZ);
				let groundAngle = Math.asin(headingOffGround.dot(pureZ)) * 180 / Math.PI;

				//aoa gets driven to zero
				Tpitch = (groundAngle * 200 - plane.omegaPitch * 200);
			}

			// let Tpitch = (0.5 * rho * plane.elevator * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength) - plane.omegaPitch * kPitchFriction;
			// K, but the horizontal stab tho...
			// Tpitch -= 0.5 * rho * aoa * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength / 200;
			// Also the wing imparts down torque
			// Tpitch -= FliftMag * 0.05;

			// console.log(aoa);

			// console.log(utils.mag(velocity));
			let kRollFriction = 200;
			let Troll = (0.5 * rho * plane.aileron * velocityOnHeading.lengthSq() * specs.aileronArea * specs.wingLength) - plane.omegaRoll * kRollFriction;
			// console.log(Troll);
			if (isNaN(Troll) || Math.abs(Troll) > 399900) {
				// console.log("speed:", plane.dx, plane.dy, plane.dz);
				console.log("projected speed:", velocityOnHeading);
				// console.log("speedSquared:", speedSquared);
				console.log("aileronArea:", specs.aileronArea);
				console.log("wingLength:", specs.wingLength);
				console.log("omegaRoll:", plane.omegaRoll);
				console.log("krollfric:", kRollFriction);
				console.log("")
				throw "error";
			}

			let kYawFriction = 2000;
			let Tyaw = (0.5 * rho * plane.rudder * velocityOnHeading.lengthSq() * specs.rudderArea * specs.tailLength) - plane.omegaYaw * kYawFriction;
			Tyaw -= 0.5 * rho * rudderAoa * velocityOnHeading.lengthSq() * specs.rudderArea * specs.tailLength / 20;
			// console.log(rudderAoa);

			// Tpitch = 0;
			Tyaw = 0;
			Troll = 0;

			// ROTATIONAL KINEMATICS **************************
			let pitchAccel = Tpitch / specs.Ipitch;
			// let pitchAxis = utils.cross(heading, up);
			// let pitchAxis = pitchAxis.negate();
			plane.omegaPitch += pitchAccel * dt;
			let pitchMovement = 0.5 * pitchAccel * dt * dt + plane.omegaPitch * dt;
			// let newUp = utils.normalize(utils.rotate(up, pitchAxis, pitchMovement));
			let newUp = up.clone().applyAxisAngle(pitchAxis, pitchMovement * Math.PI / 180).normalize();
			// let newHeading = utils.normalize(utils.rotate(heading, pitchAxis, pitchMovement));
			let newHeading = heading.clone().applyAxisAngle(pitchAxis, pitchMovement * Math.PI / 180);

			let rollAccel = Troll / specs.Iroll;
			let rollAxis = newHeading;
			plane.omegaRoll += rollAccel * dt;
			let rollMovement = 0.5 * rollAccel * dt * dt + plane.omegaRoll * dt;
			// newUp = utils.normalize(utils.rotate(up, rollAxis, rollMovement));
			newUp = newUp.clone().applyAxisAngle(rollAxis, rollMovement * Math.PI / 180).normalize()

			let yawAccel = Tyaw / specs.Iyaw;
			let yawAxis = newUp;
			plane.omegaYaw += yawAccel * dt;
			let yawMovement = 0.5 * yawAccel * dt * dt + plane.omegaYaw * dt;
			// newHeading = utils.normalize(utils.rotate(newHeading, yawAxis, yawMovement));
			newHeading = newHeading.clone().applyAxisAngle(yawAxis, yawMovement * Math.PI / 180);

			plane.up = newUp.clone();
			// plane.upX = newUp[0];
			// plane.upY = newUp[1];
			// plane.upZ = newUp[2];
			plane.heading = newHeading.clone();
			// plane.headingX = newHeading[0];
			// plane.headingY = newHeading[1];
			// plane.headingZ = newHeading[2];

			/*
				0: index
				1: x
				2: y
				3: z
				4: dx
				5: dy
				6: dz
				7: heading.x
				8: heading.y
				9: heading.z
				10: up.x
				11: up.y
				12: up.z
				13: aoa
				14: cl
				15: cd
				16: fdrag.x
				17: fdrag.y
				18: fdrag.z
				19: fthrust.x
				20: fthrust.y
				21: fthrust.z
				22: angle or something
				23: airspeed
				24: omegaPitch
			*/

			// LOGGING ****************************************

			// location, velocity, force_lift
			if (verbose) {
				console.log("plane:\t" +
					plane.x + "\t" + plane.y + "\t" + plane.z + "\t" +
					plane.dx + "\t" + plane.dy + "\t" + plane.dz + "\t" +
					plane.headingX + "\t" + plane.headingY + "\t" + plane.headingZ + "\t" +
					plane.upX + "\t" + plane.upY + "\t" + plane.upZ + "\t" +
					aoa + "\t" + cl + "\t" + cd + "\t" +
					Fdrag[0] + "\t" + Fdrag[1] + "\t" + Fdrag[2] + "\t" +
					Fthrust[0] + "\t" + Fthrust[1] + "\t" + Fthrust[2] + "\t" +
					10 * Math.atan2(plane.headingZ, plane.headingY) * 180 / Math.PI + "\t" +
					utils.mag(velocity) + "\t" +
					plane.omegaPitch
				);

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
	var angle = -20 * Math.PI / 180;
	let x = Math.cos(angle);
	let y = Math.sin(angle);
	state.blue = [
		{
			type: "fighter",
			id: 0,
			position: new THREE.Vector3(0, -8000, .7),
			// x: 0,
			// y: -8000,
			// z: 100,
			heading: new THREE.Vector3(0, x, -y),
			// headingX: 0,
			// headingY: 0,
			// headingZ: -1,
			up: new THREE.Vector3(0, y, x),
			// upX: 0,
			// upY: 1,
			// upZ: 0,
			velocity: new THREE.Vector3(0, 0, 0),
			// dx: 0,
			// dy: 0,
			// dz: 0,
			omegaRoll: 0,
			omegaPitch: 0,
			omegaYaw: 0,
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
