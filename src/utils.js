'use strict'

// Single vector operations
function mag(vec) {
	var mag = Math.sqrt(
		vec[0] * vec[0] +
		vec[1] * vec[1] +
		vec[2] * vec[2]);
	return mag;
}

function magSquared(vec) {
	return vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2];
}

function normalize(vec) {
	var mag = Math.sqrt(
		vec[0] * vec[0] +
		vec[1] * vec[1] +
		vec[2] * vec[2]);
	if (mag === 0) {
		throw new Error("Cannot normalize");
	}
	var scaled = [
		vec[0] / mag,
		vec[1] / mag,
		vec[2] / mag
	];
	return scaled;
}
function scale(vec, scale) {
	return [vec[0] * scale, vec[1] * scale, vec[2] * scale];
}


// Two vector operations
function plus() {
	let retVal = [0, 0, 0];
	for (var i = 0; i < arguments.length; i++) {
		retVal[0] += arguments[i][0];
		retVal[1] += arguments[i][1];
		retVal[2] += arguments[i][2];
	}
	return retVal;
}

function difference(u, v) {
	return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
}

function dot(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

function cross(u, v) {
	return [
		u[1] * v[2] - u[2] * v[1],
		u[2] * v[0] - u[0] * v[2],
		u[0] * v[1] - u[1] * v[0]
	];
}

function rotate(v, e, theta) {
	// rotate the vector u around axis v by angle theta
	// theta is in degrees
	theta = theta * Math.PI / 180;
	var a = scale(v, Math.cos(theta));
	var b = scale(cross(e, v), Math.sin(theta));
	var c = scale(e, dot(e, v) * (1 - Math.cos(theta)));
	var vrot = plus(plus(a, b), c);
	return vrot;
}

module.exports = {
	mag: mag,
	magSquared: magSquared,
	normalize: normalize,
	scale: scale,
	plus: plus,
	difference: difference,
	dot: dot,
	cross: cross,
	rotate: rotate
};
