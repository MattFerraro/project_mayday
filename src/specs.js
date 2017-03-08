exports.planeSpecs = {
	"fighter": {
		mass: 1,  // kg
		maxThrust: .1 * 9.8,  // N of thrust

		Iroll: 1,
		wingLength: .1,
		aileronArea: 2,

		Ipitch: 100,
		tailLength: 10,
		tailArea: 3,

		Iyaw: 100,
		rudderArea: 1.5,

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
		wingArea: 38, // m^2
		frontalArea: 2/1000 // m^2
	}
};
