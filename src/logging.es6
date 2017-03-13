'use strict'

function logEvent(event) {
	console.log(
		"EVENT",
		event);
}

function logPlane(plane, t) {
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
		plane.rotation.w)
	// console.log(plane);
}

module.exports = {
	logPlane: logPlane,
	logEvent: logEvent
};
