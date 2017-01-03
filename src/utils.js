// Single vector operations
function mag(vec) {
	var mag = Math.sqrt(
		vec[0] * vec[0] +
		vec[1] * vec[1] +
		vec[2] * vec[2]);
	return mag;
}
function normalize(vec) {
	var mag = Math.sqrt(
		vec[0] * vec[0] +
		vec[1] * vec[1] +
		vec[2] * vec[2]);
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
function plus(u, v) {
	return [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
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


exports.mag = mag;
exports.normalize = normalize;
exports.scale = scale;
exports.plus = plus;
exports.dot = dot;
exports.cross = cross;
exports.rotate = rotate;
