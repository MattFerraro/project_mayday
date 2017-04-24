'use strict'
var THREE = require("three");
let Vector3 = THREE.Vector3;
let Quat = THREE.Quaternion;
let Matrix3 = THREE.Matrix3;
let RHO = 1.2; // kg / m^3
let G = -9.8;  // m / s^2
let XAXIS = new Vector3(1, 0, 0);
let YAXIS = new Vector3(0, 1, 0);
let ZAXIS = new Vector3(0, 0, 1);
let GAIN = .1;
let PI = 3.1415926;

console.log("A");
function updateVelocity(velocity, accel, dt) {
	let deltaVelocity = accel.clone().multiplyScalar(dt);
	return deltaVelocity;
	// let newVelocity = velocity.clone().add(deltaVelocity);
	// return newVelocity;
}

function updatePosition(position, velocity, accel, dt) {
	let deltaPosition = accel.clone().multiplyScalar(dt * dt * 0.5).add(velocity.clone().multiplyScalar(dt));
	return deltaPosition;
	// let newPosition = position.clone().add(deltaPosition);
	// return newPosition;
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

function updatedPlaneState(plane, spec, dt, t) {
	// Force and Torque calculations
	// console.log(plane.velocity.length());
	let dragForce = getDragForce(plane, spec);
	let thrustForce = getThrustForce(plane, spec);
	let gravityForce = getGravityForce(plane, spec);

	let gearForceNet = new Vector3(0, 0, 0);
	let gearTorqueNet = new Vector3(0, 0, 0);
	for (let gear of spec.gear) {
		let gearForce = getGearForce(gear, plane, spec, dt);
		let gearTorque = getGearTorque(gear, plane, gearForce);
		gearForceNet.add(gearForce);
		gearTorqueNet.add(gearTorque);
	}

	let tailForceHoriz, tailForceVert;
	[tailForceHoriz, tailForceVert] = getTailForce(plane, spec);
	let tailTorqueHoriz = getTailTorque(plane, spec, tailForceHoriz);
	let tailTorqueVert = getTailTorque(plane, spec, tailForceVert);

	let alphaLeft, alphaRight, vProjLeft, vProjRight;
	[alphaLeft, alphaRight, vProjLeft, vProjRight] = getAngleOfAttack(plane, spec);
	plane.alpha = alphaLeft;
	let wingForce = getWingForce(plane, spec, alphaLeft, alphaRight, vProjLeft, vProjRight);
	// wingForce.set(0, 0, 0);
	// console.log(wingForce);

	// Rotational Kinematics
	let totalTorque = gearTorqueNet.clone().add(tailTorqueHoriz).add(tailTorqueVert); // TODO: add other torques
	// let totalTorque = gearTorqueNet.clone(); // TODO: add other torques
	let inverseI = spec.inverseI;
	let changeInAngularMomentum = totalTorque.applyMatrix3(inverseI).multiplyScalar(dt);
	let newAngularMomentum = plane.angularMomentum.clone().add(changeInAngularMomentum);
	// plane.angularMomentum.add(changeInAngularMomentum);
	let deltaRotation = updateOrientation(plane, spec, dt, newAngularMomentum);

	// Linear Kinematics
	let totalForce = dragForce.add(thrustForce).add(gearForceNet).add(gravityForce).add(tailForceHoriz).add(wingForce);
	// let totalForce = dragForce.add(thrustForce).add(gearForceNet).add(gravityForce).add(tailForceHoriz);
	// let totalForce = dragForce.add(thrustForce).add(gearForceNet).add(gravityForce);
	let totalAccel = totalForce.multiplyScalar(1/spec.mass);
	let deltaPosition = updatePosition(plane.position, plane.velocity, totalAccel, dt);
	let deltaVelocity = updateVelocity(plane.velocity, totalAccel, dt);

	return [changeInAngularMomentum, deltaRotation, deltaPosition, deltaVelocity];
}

function getWingForce(plane, spec, alphaLeft, alphaRight, vProjLeft, vProjRight) {
	let wing = spec.wing;

	let clLeft = wing.cl(alphaLeft);
	let cdLeft = wing.cd(alphaLeft);
	let chord = (wing.chordRoot + wing.chordTip) / 2;

	// let dragForceMag = .5 * cd * RHO * vProj.lengthSq() * wing.thickness * wing.length * 2;
	let liftForceMagLeft = .5 * clLeft * RHO * vProjLeft.lengthSq() * chord * wing.length * 2;

	let liftForceDirLeft = new Vector3(1, 0, 0).applyQuaternion(plane.rotation).cross(plane.velocity).normalize();
	// let dragForceDir = plane.velocity.clone().negate().normalize();

	let liftForceLeft = liftForceDirLeft.multiplyScalar(liftForceMagLeft);



	let clRight = wing.cl(alphaRight);
	let cdRight = wing.cd(alphaRight);
	// let chord = (wing.chordRoot + wing.chordTip) / 2;

	// let dragForceMag = .5 * cd * RHO * vProj.lengthSq() * wing.thickness * wing.length * 2;
	let liftForceMagRight = .5 * clRight * RHO * vProjRight.lengthSq() * chord * wing.length * 2;

	let liftForceDirRight = new Vector3(1, 0, 0).applyQuaternion(plane.rotation).cross(plane.velocity).normalize();
	// let dragForceDir = plane.velocity.clone().negate().normalize();

	let liftForceRight = liftForceDirRight.multiplyScalar(liftForceMagRight);


	// let dragForce = dragForceDir.multiplyScalar(dragForceMag);
	return liftForceLeft.clone();//.add(dragForce);
}

function updateOrientation(plane, spec, dt, angularMomentum) {
	if (angularMomentum == null) {
		angularMomentum = plane.angularMomentum;
	}
	let inverseI = spec.inverseI;
	let omegas = angularMomentum.clone().applyMatrix3(inverseI);

	let q = plane.rotation.clone();
	let qw = -(q.x * omegas.x + q.y * omegas.y + q.z * omegas.z);
	let qx =   q.w * omegas.x + q.z * omegas.y - q.y * omegas.z;
	let qy =  -q.z * omegas.x + q.w * omegas.y + q.x * omegas.z;
	let qz =   q.y * omegas.x - q.x * omegas.y + q.w * omegas.z;

	let dq = new Quat().set(
		qx * .5 * dt,
		qy * .5 * dt,
		qz * .5 * dt,
		qw * .5 * dt);
	return dq;
}

function getTailTorque(plane, spec, tailForce) {
	let r = new Vector3(0, -spec.tail.length, 0).applyQuaternion(plane.rotation);
	let M = r.clone().cross(tailForce);
	return M;
}

function getAngleOfAttack(plane, spec) {
	let heading = new Vector3(0, 1, 0).applyQuaternion(plane.rotation);
	let rightWing = new Vector3(1, 0, 0).applyQuaternion(plane.rotation);
	let up = new Vector3(0, 0, 1).applyQuaternion(plane.rotation);

	let dihedral = 5;
	let presetAoa = spec.wing.presetAoa;
	// let rightWingUnderside = new Vector3(0, 0, -1);
	// rightWingUnderside.applyAxisAngle(new Vector3(0, 1, 0), -dihedral * PI / 180);
	// rightWingUnderside.applyAxisAngle(new Vector3(1, 0, 0), presetAoa * PI / 180);
	// rightWingUnderside.applyQuaternion(plane.rotation);
	// let rightDiff = rightWingV.clone().sub(plane.velocity);

	// let leftWingWind = new Vector3(0, 1, 0).applyQuaternion(plane.rotation);
	// leftWingWind.applyAxisAngle(rightWing, presetAoa * PI / 180);
	// leftWingWind.applyAxisAngle(heading, dihedral * PI / 180)
	// leftWingV = plane.velocity.clone().projectOnVector(leftWingWind);

	let velocityProj = plane.velocity.clone().projectOnPlane(rightWing);
	let velocityProjProj = velocityProj.clone().projectOnVector(heading);
	let diff = velocityProj.clone().sub(velocityProjProj);

	let s = -Math.sign( diff.clone().dot(up) );
	let y = s * diff.length();
	let x = velocityProjProj.length();
	let angle = Math.atan2(y, x);

	return [angle, angle, velocityProj, velocityProj];
}

function getTailForce(plane, spec) {
	let heading = new Vector3(0, 1, 0).applyQuaternion(plane.rotation);
	let rightWing = new Vector3(1, 0, 0).applyQuaternion(plane.rotation);
	let up = new Vector3(0, 0, 1).applyQuaternion(plane.rotation);
	let omegas = plane.angularMomentum.clone().applyMatrix3(spec.inverseI);

	let horizForces = getHorizStabForce(plane, spec, omegas, heading, rightWing, up);
	let vertForces = getVertStabForce(plane, spec, omegas, heading, rightWing, up);
	// horizForces.add(vertForces);
	return [horizForces, vertForces];
	// Horizontal Stab
}

function getHorizStabForce(plane, spec, omegas, heading, rightWing, up) {
	let horizStab = spec.tail.horizStab;
	let apparentVelocityMag = omegas.x * spec.tail.length * -3; // This negative sign here? took me a MONTH to find it. UGH!
	let apparentVelocity = up.clone().multiplyScalar(apparentVelocityMag).add(plane.velocity);

	let velocityProj = apparentVelocity.clone().projectOnPlane(rightWing);
	let velocityProjProj = velocityProj.clone().projectOnVector(heading);
	let diff = velocityProj.clone().sub(velocityProjProj);

	let s = -Math.sign( diff.clone().dot(up) );
	let y = s * diff.length();
	let x = velocityProjProj.length();
	let angle = Math.atan2(y, x);

	angle -= (plane.elevator + plane.elevatorTrim) * horizStab.elevatorRange;
	plane.tailAngle = angle;

	let cl = horizStab.cl(angle);
	let cd = horizStab.cd(angle);

	let dragForceMag = .5 * cd * RHO * apparentVelocity.lengthSq() * horizStab.thickness * horizStab.width;
	// let liftForceMag = .5 * cl * RHO * plane.velocity.lengthSq() * horizStab.chord * horizStab.width;
	let liftForceMag = .5 * cl * RHO * apparentVelocity.lengthSq() * horizStab.chord * horizStab.width;

	let liftForceDir = new Vector3(1, 0, 0).applyQuaternion(plane.rotation).cross(plane.velocity).normalize();
	let dragForceDir = plane.velocity.clone().negate().normalize();

	let liftForce = liftForceDir.multiplyScalar(liftForceMag);
	let dragForce = dragForceDir.multiplyScalar(dragForceMag);

	let tailForce = liftForce.clone().add(dragForce);
	return tailForce;
}


function getVertStabForce(plane, spec, omegas, heading, rightWing, up) {
	let vertStab = spec.tail.vertStab;
	let apparentVelocityMag = omegas.z * spec.tail.length * 3;
	let apparentVelocity = rightWing.clone().multiplyScalar(apparentVelocityMag).add(plane.velocity);

	let velocityProj = apparentVelocity.clone().projectOnPlane(up);
	let velocityProjProj = velocityProj.clone().projectOnVector(heading);
	let diff = velocityProj.clone().sub(velocityProjProj);

	let s = -Math.sign( diff.clone().dot(rightWing) );   // POSSIBLE
	let y = s * diff.length();
	let x = velocityProjProj.length();
	let angle = Math.atan2(y, x);

	// angle += (plane.rudder) * vertStab.rudderRange;
	plane.rudderAngle = angle;

	let cl = vertStab.cl(angle);
	let cd = vertStab.cd(angle);

	// let dragForceMag = .5 * cd * RHO * apparentVelocity.lengthSq() * vertStab.thickness * vertStab.width;
	let liftForceMag = .5 * cl * RHO * apparentVelocity.lengthSq() * vertStab.chord * vertStab.width;

	let liftForceDir = new Vector3(0, 1, 0).applyQuaternion(plane.rotation).cross(plane.velocity).normalize();
	// let dragForceDir = plane.velocity.clone().negate().normalize();

	let liftForce = liftForceDir.multiplyScalar(-liftForceMag);
	// let dragForce = dragForceDir.multiplyScalar(dragForceMag);

	// let tailForce = liftForce.clone().add(dragForce);
	// return tailForce;
	return liftForce;
}

function getGearTorque(gear, plane, gearForce) {
	//gearForce is in the global frame, ie it has already been rotated
	let r = gear.position.clone().applyQuaternion(plane.rotation);
	let M = r.clone().cross(gearForce);
	return M;
}

function getGearForce(gear, plane, spec, dt) {
	let gearTip = gear.position.clone().applyQuaternion(plane.rotation).add(plane.position);
	let gearVector = new Vector3(0, 0, -1).applyQuaternion(plane.rotation);
	let gearToGroundDist = gearTip.z / -gearVector.z;

	if (gearToGroundDist > gear.length) {
		// gear.lastLength = gear.length;
		return new Vector3(0, 0, 0);
	}
	else {
		let totalAccel = new Vector3(0, 0, 0);
		let deltaPosition = updatePosition(plane.position, plane.velocity, totalAccel, dt);
		let newPosition = plane.position.clone().add(deltaPosition);
		let deltaRotation = updateOrientation(plane, spec, dt, null);
		let newRotation = new Quat().set(
			plane.rotation.x + deltaRotation.x,
			plane.rotation.y + deltaRotation.y,
			plane.rotation.z + deltaRotation.z,
			plane.rotation.w + deltaRotation.w
		).normalize();

		let gearTip2 = gear.position.clone().applyQuaternion(newRotation).add(newPosition);
		let gearVector2 = new Vector3(0, 0, -1).applyQuaternion(newRotation);
		let gearToGroundDist2 = gearTip2.z / -gearVector2.z;

		let compressionSpeed = (gearToGroundDist - gearToGroundDist2) / dt;

		let forceMag = springDamperForce(gearToGroundDist, compressionSpeed, gear.length, gear.k, gear.b);
		let force = new Vector3(0, 0, 1).multiplyScalar(-forceMag);

		return force;
	}
}

function getDragForce(plane, spec) {
	let heading = new Vector3(0, 1, 0).applyQuaternion(plane.rotation);
	let velocity = plane.velocity.clone();
	let mag = 0.5 * RHO * velocity.lengthSq() * spec.frontalArea * spec.frontalCd;
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
	updatedPlaneState: updatedPlaneState
};
