var utils = require("./src/utils.js");

describe("Vector tests", function() {
  it("Tests the vectors", function() {
    expect(utils.plus([0, 1, 0], [0, 0, 1], [1, 0, 0])).toEqual([1, 1, 1]);

    expect(utils.mag([0, 1, 0])).toEqual(1);
    expect(utils.mag([0, 0, 0])).toEqual(0);
    expect(utils.mag([-1, 0, 0])).toEqual(1);
    expect(utils.mag([0, -3, 4])).toEqual(5);

    expect(utils.magSquared([0, 3, -4])).toEqual(25);
    expect(utils.magSquared([0, 0, 0])).toEqual(0);
    expect(utils.magSquared([-1, 1, 1])).toEqual(3);


    expect(utils.normalize([0, 0, 10])).toEqual([0, 0, 1]);
    expect(function() {
    	utils.normalize([0, 0, 0]);
    }).toThrow(new Error("Cannot normalize"));
    expect(utils.normalize([0, 10, -10])).toEqual([0, Math.sin(Math.PI / 4), -Math.sin(Math.PI / 4)]);

    expect(utils.normalize([0, 0, 10])).toEqual([0, 0, 1]);

    expect(utils.cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(utils.cross([-1, 0, 0], [0, 1, 0])).toEqual([0, 0, -1]);
    expect(utils.cross([1, 0, 0], [0, -1, 0])).toEqual([0, 0, -1]);

    expect(utils.cross([0, 1, 0], [1, 0, 0])).toEqual([0, 0, -1]);
    expect(utils.cross([0, -1, 0], [1, 0, 0])).toEqual([-0, 0, 1]);
    expect(utils.cross([0, 1, 0], [-1, 0, 0])).toEqual([0, -0, 1]);

    expect(utils.cross([0, 1, 0], [0, 0, 1])).toEqual([1, 0, 0]);
    expect(utils.cross([0, 1, 0], [0, 0, 1])).toEqual([1, 0, 0]);
  });
});


describe("Lift tests", function() {
    it("Calculates lift", function() {
        expect()
    });
});
