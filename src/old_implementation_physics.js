
			// // USEFUL VECTORS AND VALUES ****************
			// let heading = plane.heading.clone().normalize();
			// let up = plane.up.clone().normalize();
			// let velocity = plane.velocity.clone();

			// let liftDirection = up.clone().projectOnPlane(velocity).normalize();
			// let pitchAxis = up.clone().cross(heading).normalize();
			// let liftVelocity = velocity.clone().projectOnPlane(pitchAxis);
			// let velocityOnHeading = velocity.clone().projectOnVector(heading);

			// // velocity vector is a little more tricky if we
			// // want to calculate angle of attack
			// // let velocityNorm = new THREE.Vector3();
			// if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {
			// 	// if we have a meaningful velocity
			// 	var velocityNorm = velocity.clone().normalize();
			// }
			// else {
			// 	// if we are still, we use velocity = heading
			// 	var velocityNorm = heading.clone().normalize();
			// 	console.log("still!");
			// }

			// // find angle of attack, cl and cd
			// let diff = heading.clone().sub(velocityNorm);

			// // let aoa = Math.asin(diff.clone().projectOnVector(up).length()) * 180 / Math.PI;
			// let aoa = Math.asin(diff.clone().projectOnVector(up).dot(up)) * 180 / Math.PI;
			// // project the velocity vector onto the plane described by the up/heading vectors
			// let projectedVelocity = velocityNorm.clone().projectOnPlane(pitchAxis);
			// // let aoa2 = projectedVelocity.angleTo(heading) * 180 / Math.PI;
			// // if (aoa2 < minAoa) {
			// // 	minAoa = aoa2;
			// // }

			// // project the velocity vector on to the plane described by the up vector
			// // let projectedVelocity2 = velocityNorm.clone().projectOnPlane(up);
			// // let rudderAoa = projectedVelocity2.angleTo(heading);
			// // let rudderAoa = liftVelocity.angleTo(velocity) * 180 / Math.PI;

			// // let aoa = Math.asin(diff.clone().projectOnVector(up).length()) * 180 / Math.PI;
			// // let aoa = Math.asin(utils.dot(diff, up)) * 180 / Math.PI;


			// // let rudderUp = up.clone().cross(heading);
			// // let rudderUp = utils.cross(up, heading);
			// // let rudderAoa = Math.asin(utils.dot(diff, rudderUp)) * 180 / Math.PI;
			// let rudderAoa = Math.asin(diff.clone().projectOnVector(pitchAxis).length()) * 180 / Math.PI;

			// // let firstCross = utils.cross(heading, velocityNorm);
			// // let secondCross = utils.cross(firstCross, up);
			// // let c = utils.dot(heading, secondCross);
			// // let aoa = Math.asin(c) * 180 / Math.PI; // in degrees
			// let cl = specs.cl(aoa);
			// let cd = specs.cd(aoa);


			// // Project velocity onto heading
			// // let velocityOnHeading = utils.scale(velocity, utils.dot(velocityNorm, heading));
			// // If the airplane is crabbing, we get cosine loss of velocity.
			// // However if the airplane is pulling up, we get full velocity

			// // let liftDirection = velocityNorm.clone().cross(pitchAxis).normalize();



			// // FORCES **********************************
			// // gravity pulls you down
			// // let Fgrav = [0, 0, G * specs.mass];
			// let Fgrav = new Vector3(0, 0, G * specs.mass);
			// // let FgravMag = utils.mag(Fgrav);
			// // console.log("F grav:", Fgrav);

			// // lift scales with v^2
			// // let speedSquared = utils.magSquared(velocityOnHeading);
			// // let speedSquared = velocityOnHeading.lengthSq();
			// let FliftMag = 0.5 * rho * cl * specs.wingArea * liftVelocity.lengthSq();
			// // lift pulls you up
			// // console.log("Flift direction", liftDirection);
			// let Flift = liftDirection.clone().setLength(FliftMag);

			// // thrust pushes you forward
			// let FthrustMag = plane.thrust * specs.maxThrust;
			// let Fthrust = heading.clone().setLength(FthrustMag);

			// // drag pulls you back
			// let FdragMag = 0.5 * rho * cd * specs.frontalArea * velocity.lengthSq();

			// let Fdrag = velocityNorm.clone().negate().setLength(FdragMag);

			// // let Fnet = utils.plus(utils.plus(utils.plus(Fgrav, Flift), Fdrag), Fthrust);
			// let Fnet = Fgrav.clone().add(Flift).add(Fdrag).add(Fthrust);


			// // if near the ground, the landing gear pushes you up
			// if (plane.position.z <= 1) {
			// 	let k = specs.mass * 9.8 * 2;
			// 	let compression = 1 - plane.position.z;
			// 	let k2 = 8000;
			// 	let Fspring = new Vector3(0, 0, compression * k - velocity.z * k2);
			// 	// let Fspring = utils.scale([0, 0, 1], compression * k - plane.dz * Math.abs(k2));
			// 	// console.log("F spring:", Fspring);

			// 	Fnet = Fnet.clone().add(Fspring);
			// 	// console.log("F net:", Fnet);
			// }

			// // console.log("fgrav", Fgrav);
			// // console.log("flift", Flift);
			// // console.log("fdrag", Fdrag);
			// // console.log("fthrust", Fthrust);


			// // LINEAR KINEMATICS ******************************
			// // let accel = utils.scale(Fnet, 1/specs.mass);
			// let accel = Fnet.clone().divideScalar(specs.mass);

			// let deltaVelocity = accel.clone().multiplyScalar(dt);

			// // DO NOT UPDATE THE VELOCITY
			// plane.velocity.add(deltaVelocity);
			// // console.log(Fnet);

			// // plane.dx += accel[0] * dt;
			// // plane.dy += accel[1] * dt;
			// // plane.dz += accel[2] * dt;

			// let deltaPosition = accel.clone().multiplyScalar(dt * dt * 0.5).add(velocity.clone().multiplyScalar(dt));
			// // DO NOT UPDATE THE POSITION
			// plane.position.add(deltaPosition);

			// // plane.x += 0.5 * accel[0] * dt * dt + plane.dx * dt;
			// // plane.y += 0.5 * accel[0] * dt * dt + plane.dy * dt;
			// // plane.z += 0.5 * accel[0] * dt * dt + plane.dz * dt;

			// // TORQUES ****************************************
			// let kPitchFriction = 200;

			// let Tpitch = 0;
			// if (plane.position.z < 1) {
			// 	let pureZ = new Vector3(0, 0, 1);
			// 	let headingOffGround = heading.clone().projectOnVector(pureZ);
			// 	let groundAngle = Math.asin(headingOffGround.dot(pureZ)) * 180 / Math.PI;

			// 	//aoa gets driven to zero
			// 	Tpitch = (groundAngle * 200 - plane.omegaPitch * 0);
			// }
			// Tpitch += 0.5 * rho * (aoa - plane.elevator * 5) * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength / 2;
			// Tpitch -= plane.omegaPitch * 2000;
			// Tpitch -= FliftMag * 0.5;
			// // Tpitch += 0.5 * rho * aoa * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength / 2;

			// // let Tpitch = (0.5 * rho * plane.elevator * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength) - plane.omegaPitch * kPitchFriction;
			// // K, but the horizontal stab tho...
			// // Tpitch -= 0.5 * rho * aoa * liftVelocity.lengthSq() * specs.tailArea * specs.tailLength / 200;
			// // Also the wing imparts down torque
			// // Tpitch -= FliftMag * 0.05;

			// if (plane.position.z < 1) {
			// 	let pureZ = new Vector3(0, 0, 1);
			// 	// let
			// }
			// let kRollFriction = 200;
			// let Troll = (0.5 * rho * plane.aileron * velocityOnHeading.lengthSq() * specs.aileronArea * specs.wingLength) - plane.omegaRoll * kRollFriction;

			// let kYawFriction = 2000;
			// let Tyaw = (0.5 * rho * plane.rudder * velocityOnHeading.lengthSq() * specs.rudderArea * specs.tailLength) - plane.omegaYaw * kYawFriction;
			// Tyaw -= 0.5 * rho * rudderAoa * velocityOnHeading.lengthSq() * specs.rudderArea * specs.tailLength / 20;

			// // Tpitch = 0;
			// Tyaw = 0;
			// Troll = 0;

			// // ROTATIONAL KINEMATICS **************************
			// let pitchAccel = Tpitch / specs.Ipitch;
			// // let pitchAxis = utils.cross(heading, up);
			// // let pitchAxis = pitchAxis.negate();
			// plane.omegaPitch += pitchAccel * dt;
			// let pitchMovement = 0.5 * pitchAccel * dt * dt + plane.omegaPitch * dt;
			// // let newUp = utils.normalize(utils.rotate(up, pitchAxis, pitchMovement));
			// let newUp = up.clone().applyAxisAngle(pitchAxis, pitchMovement * Math.PI / 180).normalize();
			// // let newHeading = utils.normalize(utils.rotate(heading, pitchAxis, pitchMovement));
			// let newHeading = heading.clone().applyAxisAngle(pitchAxis, pitchMovement * Math.PI / 180);

			// let rollAccel = Troll / specs.Iroll;
			// let rollAxis = newHeading;
			// plane.omegaRoll += rollAccel * dt;
			// let rollMovement = 0.5 * rollAccel * dt * dt + plane.omegaRoll * dt;
			// // newUp = utils.normalize(utils.rotate(up, rollAxis, rollMovement));
			// newUp = newUp.clone().applyAxisAngle(rollAxis, rollMovement * Math.PI / 180).normalize()

			// let yawAccel = Tyaw / specs.Iyaw;
			// let yawAxis = newUp;
			// plane.omegaYaw += yawAccel * dt;
			// let yawMovement = 0.5 * yawAccel * dt * dt + plane.omegaYaw * dt;
			// // newHeading = utils.normalize(utils.rotate(newHeading, yawAxis, yawMovement));
			// newHeading = newHeading.clone().applyAxisAngle(yawAxis, yawMovement * Math.PI / 180);

			// plane.up = newUp.clone();
			// // plane.upX = newUp[0];
			// // plane.upY = newUp[1];
			// // plane.upZ = newUp[2];
			// plane.heading = newHeading.clone();
			// // plane.headingX = newHeading[0];
			// // plane.headingY = newHeading[1];
			// // plane.headingZ = newHeading[2];

			// /*
			// 	0: index
			// 	1: x
			// 	2: y
			// 	3: z
			// 	4: dx
			// 	5: dy
			// 	6: dz
			// 	7: heading.x
			// 	8: heading.y
			// 	9: heading.z
			// 	10: up.x
			// 	11: up.y
			// 	12: up.z
			// 	13: aoa
			// 	14: cl
			// 	15: cd
			// 	16: fdrag.x
			// 	17: fdrag.y
			// 	18: fdrag.z
			// 	19: fthrust.x
			// 	20: fthrust.y
			// 	21: fthrust.z
			// 	22: angle or something
			// 	23: airspeed
			// 	24: omegaPitch
			// */

			// // LOGGING ****************************************

			// // location, velocity, force_lift
			// if (verbose) {
			// 	console.log("plane:\t" +
			// 		plane.x + "\t" + plane.y + "\t" + plane.z + "\t" +
			// 		plane.dx + "\t" + plane.dy + "\t" + plane.dz + "\t" +
			// 		plane.headingX + "\t" + plane.headingY + "\t" + plane.headingZ + "\t" +
			// 		plane.upX + "\t" + plane.upY + "\t" + plane.upZ + "\t" +
			// 		aoa + "\t" + cl + "\t" + cd + "\t" +
			// 		Fdrag[0] + "\t" + Fdrag[1] + "\t" + Fdrag[2] + "\t" +
			// 		Fthrust[0] + "\t" + Fthrust[1] + "\t" + Fthrust[2] + "\t" +
			// 		10 * Math.atan2(plane.headingZ, plane.headingY) * 180 / Math.PI + "\t" +
			// 		utils.mag(velocity) + "\t" +
			// 		plane.omegaPitch
			// 	);

			// }
