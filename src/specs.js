'use strict'
var THREE = require("three");
var Vector3 = THREE.Vector3;

var b = 3.0;
var pi = 3.14159;
var l = 0.15;

exports.planeSpecs = {
	"fighter": {
		mass: 1,  // kg
		I: new THREE.Matrix3().set(.5, 0, 0, 0, .5, 0, 0, 0, .5),  // mks units
		maxThrust: .1 * 9.8,  // N of thrust
		frontalArea: 2/1000, // m^2

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
				k: 30,
				b: b,
				lastLength: l
			}, // front right
			{
				position: new Vector3(-.25, .2, -0.15),
				length: l,
				k: 30,
				b: b,
				lastLength: l
			}, // front left
			{
				position: new Vector3(0, -1.0, -0.05),
				length: l,
				k: 15,
				b: b,
				lastLength: l,
			}, // tail dragger
		],

		tail: {
			length: 1,
			horizStab: {
				chord: .2,
				width: .5,
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
				}
			},
			vertStab: {
				chord: .2,
				width: .25,
				thickness: 0.01,
				cl: function(aoa) {
					// aoa is in radians
					return 2 * 3.14159 * aoa; //simple symmetrical wing
				},
				cd: function(aoa) {
					//aoa is in radians
					return aoa * aoa * 13 + 0.025;
				}
			}
		},

		fuselage: {
			length: .4
		},

		wing: {
			position: new Vector3(0, -.3 * 3/4, .1),
			chordRoot: .3,
			chordTip: .1,
			length: .75,
			rightWingDir: new Vector3(1, 0, .1)
		}

	}
};
