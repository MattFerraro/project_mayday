'use strict'
var THREE = require("three");
let Vector3 = THREE.Vector3;
let RHO = 1.2; // kg / m^3
let G = -9.8;  // m / s^2

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
	let heading = plane.heading.clone().normalize();
	let up = plane.up.clone().normalize();
	let velocity = plane.velocity.clone();

	// Force calculations
	let dragForce = getDragForce(plane, spec);
	let thrustForce = getThrustForce(plane, spec);

	let totalForce = dragForce.add(thrustForce);
	let totalAccel = totalForce.multiplyScalar(1/spec.mass);

	let newPosition = updatePosition(plane.position, plane.velocity, totalAccel, dt);
	let newVelocity = updateVelocity(plane.velocity, totalAccel, dt);
	plane.position.set(newPosition.x, newPosition.y, newPosition.z);
	plane.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);

	console.log(plane.velocity.length());
	return plane;
}

function getDragForce(plane, spec) {
	let heading = plane.heading.clone().normalize();
	let velocity = plane.velocity.clone();
	let mag = 0.5 * RHO * velocity.lengthSq() * spec.frontalArea;
	return heading.multiplyScalar(-mag); // the negative makes it backwards
}

function getThrustForce(plane, spec) {
	let mag = spec.maxThrust * plane.thrust;
	let heading = plane.heading.clone().normalize();
	return heading.multiplyScalar(mag);
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
