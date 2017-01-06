// import * as utils from "./utils";
// var utils = require('./utils.js');
import * as teamRed from "./teamOne";
// var teamRed = require("./teamOne.js");
import * as teamBlue from "./teamTwo";
var simulation = require("./simulation");
// var planeSpecs = require('./specs.js');

var _ = require('lodash');
var winston = require('winston');
winston.level = "info";

var LOGLEVEL = 5;
var TIMESTEPS = 20 * 60;
var DT = 0.05;

function initialize() {
    let globalState = simulation.initialize(teamRed, teamBlue);
    simulation.run(globalState, TIMESTEPS, DT);
}

initialize();
