import * as teamRed from "./teamOne";
// var teamRed = require("./teamOne.js");
import * as teamBlue from "./teamTwo";
var simulation = require("./simulation");


var _ = require('lodash');

var stretch = 1;
var LOGLEVEL = 5;
var n = 1;
var DT = 0.05 / 2;
var TIMESTEPS = 65 / DT;

function initialize() {
    let globalState = simulation.initialize(teamRed, teamBlue);
    simulation.run(globalState, TIMESTEPS, DT, LOGLEVEL, "verlet");
}

initialize();
