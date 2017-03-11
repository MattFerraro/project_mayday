'use strict'
var THREE = require("three");
let Vector3 = THREE.Vector3;
let Quat = THREE.Quaternion;
let RHO = 1.2; // kg / m^3
let G = -9.8;  // m / s^2
let XAXIS = new Vector3(1, 0, 0);
let YAXIS = new Vector3(0, 1, 0);
let ZAXIS = new Vector3(0, 0, 1);

function updateVelocity(velocity, accel, dt) {
	let deltaVelocity = accel.clone().multiplyScalar(dt);
	let newVelocity = velocity.clone().add(deltaVelocity);
	return newVelocity;
}

function updatePosition(position, velocity, accel, dt) {
	let deltaPosition = accel.clone().multiplyScalar(dt * dt * 0.5).add(velocity.clone().multiplyScalar(dt));
	let newPosition = position.clone().add(deltaPosition);
	return newPosition;
}

function updateOmega(omega, angularAccel, dt) {
	let newOmega = omega + angularAccel * dt;
	return newOmega;
}

function updateTheta(theta, omega, angularAccel, dt) {
	let newTheta = theta + omega * dt + 0.5 * angularAccel * dt * dt;
	return newTheta;
}

function springDamperForce(currentLength, compressionSpeed, length, k, b) {
	// If the return value is negative, the force is trying to expand the spring
	// compressionSpeed being positive means the spring is being actively compressed
	// A standard spring will have positive k and positive b
	if (currentLength > length) {
		return 0;
	}
	let compression = length - currentLength;
	return -k * compression - b * compressionSpeed;
}

function updatePlaneState(plane, spec, dt) {
	// let heading =  plane.heading.clone().normalize();
	// let up = plane.up.clone().normalize();
	// let velocity = plane.velocity.clone();

	// Force calculations
	let dragForce = getDragForce(plane, spec);
	let thrustForce = getThrustForce(plane, spec);
	let gravityForce = getGravityForce(plane, spec);

	let gearForceNet = new Vector3(0, 0, 0);
	let gearTorqueNet = new Vector3(0, 0, 0);
	for (let gear of spec.gear) {
		let gearForce = getGearForce(gear, plane, spec);
		// let gearTorque = getGearTorque(gear, gearForce);
		gearForceNet.add(gearForce);
		// gearTorqueNet.add(gearTorque);
	}
	console.log("GF:", gearForceNet.x, gearForceNet.y, gearForceNet.z);

	let totalForce = dragForce.add(thrustForce).add(gearForceNet).add(gravityForce);
	let totalAccel = totalForce.multiplyScalar(1/spec.mass);

	let newPosition = updatePosition(plane.position, plane.velocity, totalAccel, dt);
	let newVelocity = updateVelocity(plane.velocity, totalAccel, dt);
	plane.position.set(newPosition.x, newPosition.y, newPosition.z);
	plane.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
}

function getGearTorque(gear, gearForce) {

}

function getGearForce(gear, plane, spec) {
	let gearTip = gear.position.clone().applyQuaternion(plane.rotation).add(plane.position);
	let gearVector = new Vector3(0, 0, -1).applyQuaternion(plane.rotation);
	let gearToGroundDist = gearTip.z / -gearVector.z;

	if (gearToGroundDist > gear.length) {
		return new Vector3(0, 0, 0);
	}
	else {
		let forceMag = springDamperForce(gearToGroundDist, 0, gear.length, gear.k, gear.b);
		let force = gearVector.clone().negate().multiplyScalar(-forceMag);
		return force;
	}
}

function getDragForce(plane, spec) {
	// let heading = plane.heading.clone().normalize();
	let heading = new Vector3(0, 1, 0).applyQuaternion(plane.rotation);
	let velocity = plane.velocity.clone();
	let mag = 0.5 * RHO * velocity.lengthSq() * spec.frontalArea;
	return heading.multiplyScalar(-mag); // the negative makes it backwards
}

function getThrustForce(plane, spec) {
	let heading = new Vector3(0, 1, 0).applyQuaternion(plane.rotation);
	let mag = spec.maxThrust * plane.thrust;
	return heading.multiplyScalar(mag);
}

function getGravityForce(plane, spec) {
	let mag = spec.mass * 9.8;
	let direction = new Vector3(0, 0, -1);
	return direction.multiplyScalar(mag);
}

function radians(angleInDegrees) {
	return angleInDegrees * 3.14159 * 180;
}

function degrees(angleInRadians) {
	return angleInRadians * 180 / 3.14159;
}

module.exports = {
	updateVelocity: updateVelocity,
	updatePosition: updatePosition,
	updateOmega: updateOmega,
	updateTheta: updateTheta,
	springDamperForce: springDamperForce,
	updatePlaneState: updatePlaneState
};
