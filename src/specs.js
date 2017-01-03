exports.planeSpecs = {
	"fighter": {
		mass: 1000,
		maxThrust: 500,
		Iroll: 100,
		maxRoll: 100,
		Ipitch: 100,
		maxPitch: 10,
		Iyaw: 100,
		maxYaw: 100,
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
		frontalArea: 16 // m^2
	}
};
