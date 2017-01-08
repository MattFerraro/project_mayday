// var teamRed = require("./teamOne");
// var teamBlue = require("./teamLive");
import * as teamRed from "./teamOne";
import * as teamBlue from "./teamLive";
// import * as teamBlue from "./teamTwo";

var simulation = require("./simulation");
var DT = 0.05; // make this more accurate by measuring true FPS
var globalState;

var graphics = require("./graphics");
var THREE = require("three");
var $ = require("jquery");

var renderer, camera, scene;

function init() {
    // Initialize all the graphics
    renderer = graphics.buildRenderer();
    camera = graphics.buildCamera();
    scene = graphics.buildScene();
    graphics.addLighting(scene);
    document.body.appendChild( renderer.domElement );

    globalState = simulation.initialize(teamRed, teamBlue);
    // let commands = teamBlue.getCommands(globalState, 0.5);
}

function animate() {
    // console.log("animating");
    simulation.step(globalState, DT);

    let plane = globalState.blue[0];

    // Set camera position
    camera.position.setX(plane.position.x);
    camera.position.setY(plane.position.y);
    camera.position.setZ(plane.position.z);

    // Set camera up vector
    camera.up = plane.up.clone();
    // camera.up = new THREE.Vector3(plane.upX, plane.upY, plane.upZ);

    // Set camera lookat vector
    // let a = new THREE.Vector3(plane.headingX, plane.headingY, plane.headingZ);
    let heading = plane.heading.clone();
    heading.add(camera.position);
    camera.lookAt(heading);

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}

init();
animate();
