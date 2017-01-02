exports.mag = function(vec) {
	var mag = Math.sqrt(
		vec[0] * vec[0] +
		vec[1] * vec[1] +
		vec[2] * vec[2]);
	return mag;
}

exports.dot = function(u, v) {
	return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

exports.scale = function(vec, scale) {
	return [vec[0] * scale, vec[1] * scale, vec[2] * scale];
}

exports.normalize = function(vec) {
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

exports.plus = function(u, v) {
	return [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
}

exports.cross = function(u, v) {
	return [
		u[1] * v[2] - u[2] * v[1],
		u[2] * v[0] - u[0] * v[2],
		u[0] * v[1] - u[1] * v[0]
	];
}
