'use strict'
var THREE = require("three");
var physics = require("./src/physics.es6");
let Vector3 = THREE.Vector3;
let Quat = THREE.Quaternion;
let PI = 3.14159;

describe("Physics tests", function() {
    it("Calculates Kinematics", function() {
        // Basic test of updatePosition and updateVelocity
        let position = new Vector3(0, 0, 10);
        let velocity = new Vector3(0, 0, 0);
        let acceleration = new Vector3(0, 0, -9.8);

        let dt = 1;
        let newPosition = physics.updatePosition(position, velocity, acceleration, dt);
        let newVelocity = physics.updateVelocity(velocity, acceleration, dt);
        expect(newVelocity).toEqual(new Vector3(0, 0, -9.8));
        expect(newPosition).toEqual(new Vector3(0, 0, 10 - 4.9));

        // Basic test of updateOmega and updateTheta
        let theta = 0;
        let angularAccel = 1;
        let omega = 0;
        let newTheta = physics.updateTheta(theta, omega, angularAccel, dt);
        let newOmega = physics.updateOmega(omega, angularAccel, dt);
        expect(newOmega).toEqual(1);
        expect(newTheta).toEqual(0.5);
    });
    it("Models Spring Mass Damper Systems", function() {
        let F = physics.springDamperForce(5, 0, 10, 1, 0);
        expect(F).toEqual(-5);

        F = physics.springDamperForce(10, 1, 10, 0, 2);
        expect(F).toEqual(-2);
    });
});

describe("Quat testing", function() {
    it("tests quats", function() {
        let overX = new Quat();
        let overY = new Quat();
        let overZ = new Quat();

        let xAxis = new Vector3(1, 0, 0);
        let yAxis = new Vector3(0, 1, 0);
        let zAxis = new Vector3(0, 0, 1);

        overX.setFromAxisAngle(xAxis, PI / 2);
        overY.setFromAxisAngle(yAxis, PI / 2);
        overZ.setFromAxisAngle(zAxis, PI / 2);

        expect(yAxis.clone().applyQuaternion(overX).sub(zAxis).length()).toBeCloseTo(0);
        expect(zAxis.clone().applyQuaternion(overY).sub(xAxis).length()).toBeCloseTo(0);
        expect(xAxis.clone().applyQuaternion(overZ).sub(yAxis).length()).toBeCloseTo(0);

        expect(xAxis.clone().applyQuaternion(overZ).applyQuaternion(overX).sub(zAxis).length()).toBeCloseTo(0);


        // expect(new Vector3(.15, .05, -.05).cross(new Vector3(0, 0, 3.7666))).toEqual(zAxis);
    });
});
