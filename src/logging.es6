'use strict'

function logEvent(event) {
	console.log(
		"EVENT",
		event);
}

function logPlane(plane) {
	console.log(
		"PLANE_DATA",
		plane.id,
		plane.position.x, //2
		plane.position.y, //3
		plane.position.z, //4
		plane.velocity.x, //5
		plane.velocity.y,
		plane.velocity.z)
	// console.log(plane);
}

module.exports = {
	logPlane: logPlane,
	logEvent: logEvent
};
