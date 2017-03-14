import * as teamRed from "./teamOne";
// var teamRed = require("./teamOne.js");
import * as teamBlue from "./teamTwo";
var simulation = require("./simulation");


var _ = require('lodash');

var LOGLEVEL = 5;
var n = 1;
var TIMESTEPS = 60 * 6 * n;
var DT = 0.05 * 1/n;

function initialize() {
    let globalState = simulation.initialize(teamRed, teamBlue);
    simulation.run(globalState, TIMESTEPS, DT, LOGLEVEL);
}

initialize();
