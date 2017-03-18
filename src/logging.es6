'use strict'
var THREE = require("three");

function logEvent(event) {
	console.log(
		"EVENT",
		event);
}

function logPlane(plane, spec, t) {
	let ea = new THREE.Euler().setFromQuaternion(plane.rotation, 'XYZ').toVector3();
	let inverseI = new THREE.Matrix3().getInverse(spec.I);
	let omegas = plane.angularMomentum.clone().applyMatrix3(inverseI);
	console.log(
		"PLANE_DATA",
		t,   //1
		plane.id,
		plane.position.x, //3
		plane.position.y, //4
		plane.position.z, //5
		plane.velocity.x,
		plane.velocity.y,
		plane.velocity.z,
		plane.rotation.x,
		plane.rotation.y,
		plane.rotation.z,
		plane.rotation.w,
		ea.x, //13
		ea.y,
		ea.z,
		omegas.x, //16
		omegas.y,
		omegas.z);
	// console.log(plane);
}

module.exports = {
	logPlane: logPlane,
	logEvent: logEvent
};
