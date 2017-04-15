'use strict'
var THREE = require("three");
var Vector3 = THREE.Vector3;

var b = 2.0;
var pi = 3.14159;
var l = 0.15;
var landingGearK = 50;

var planeSpecs = {
	"fighter": {
		mass: .8,  // kg
		I: new THREE.Matrix3().set(1, 0, 0, 0, .6, 0, 0, 0, 1),  // mks units
		maxThrust: .15 * 9.8,  // N of thrust
		frontalArea: 2.0/100, // m^2,
		frontalCd: 1.7,

		cd: function(aoa) {
			// aoa is in degrees
			var x = (aoa) / 16;
			return x * x + 0.025;
		},
		cl: function(aoa) {
			// aoa is in degrees
			// -((x-16)/16)**2 + 1.8
			var x = (aoa - 16) / 16;
			return -x * x + 1.8;
		},
		gear: [
			{
				position: new Vector3(.25, .2, -0.15),
				length: l,
				k: landingGearK,
				b: b,
			}, // front right
			{
				position: new Vector3(-.25, .2, -0.15),
				length: l,
				k: landingGearK,
				b: b,
			}, // front left
			{
				position: new Vector3(0, -1, -0.05),
				length: l,
				k: landingGearK,
				b: b,

			}, // tail dragger
			// {
			// 	position: new Vector3(.25, -.4, -0.15),
			// 	length: l,
			// 	k: landingGearK,
			// 	b: b,
			// }, // square
			// {
			// 	position: new Vector3(-.25, -.4, -0.15),
			// 	length: l,
			// 	k: landingGearK,
			// 	b: b,
			// } // square
		],

		tail: {
			length: 1,
			horizStab: {
				// chord: .20,
				// width: .40,
				chord: .25,
				width: .55,
				thickness: 0.01,
				cl: function(aoa) {
					console.log("tail aoa", aoa * 180 / pi);
					// aoa is in radians
					if (aoa > 15*pi/180 && aoa < 20*pi/180) {
						aoa = 15*pi/180;
					}
					else if (aoa > 20*pi/180) {
						aoa = 0;
					}

					if (aoa < -15*pi/180 && aoa > -20*pi/180) {
						aoa = -15*pi/180;
					}
					else if (aoa < -20*pi/180) {
						aoa = 0;
					}

					let res = 2 * 3.14159 * aoa * .9;
					return res; //simple symmetrical wing
				},
				cd: function(aoa) {
					//aoa is in radians
					return aoa * aoa * 13 + 0.025;
				},
				elevatorRange: 2 * pi / 180
			},
			vertStab: {
				chord: .2,
				width: .25,
				thickness: 0.01,
				cl: function(aoa) {
					// aoa is in radians
					if (aoa > 15*pi/180 && aoa < 20*pi/180) {
						aoa = 15*pi/180;
					}
					else if (aoa > 20*pi/180) {
						aoa = 0;
					}

					if (aoa < -15*pi/180 && aoa > -20*pi/180) {
						aoa = -15*pi/180;
					}
					else if (aoa < -20*pi/180) {
						aoa = 0;
					}

					let res = 2 * 3.14159 * aoa;
					return res; //simple symmetrical wing
				},
				cd: function(aoa) {
					//aoa is in radians
					return aoa * aoa * 13 + 0.025;
				},
				rudderRange: 5 * pi / 180
			}
		},

		fuselage: {
			length: .4
		},

		wing: {
			position: new Vector3(0, -.3 * 3/4, .1),
			chordRoot: .3,
			chordTip: .20,
			length: .85,  // length of a single wing
			thickness: 0.025,
			rightWingDir: new Vector3(1, 0, .1),
			cl: function(aoa) {
				// aoa is in radians
				aoa += 3 * pi / 180;
				if (aoa > 15*pi/180 && aoa < 20*pi/180) {
					aoa = 15*pi/180;
				}
				else if (aoa > 20*pi/180) {
					aoa = 0;
				}

				if (aoa < -15*pi/180 && aoa > -20*pi/180) {
					aoa = -15*pi/180;
				}
				else if (aoa < -20*pi/180) {
					aoa = 0;
				}

				let res = 2 * 3.14159 * aoa;
				return res; //simple symmetrical wing
			},
			cd: function(aoa) {
				//aoa is in radians
				return aoa * aoa * 13 + 0.025;
			},
			aileronRange: 1 * pi / 180
		}

	}
};

exports.planeSpecs = planeSpecs;
