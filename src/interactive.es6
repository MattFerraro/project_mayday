// var teamRed = require("./teamOne");
// var teamBlue = require("./teamLive");
import * as teamRed from "./teamOne";
// import * as teamBlue from "./teamLive";
import * as teamBlue from "./teamTwo";

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

var count = 0;
function animate() {
    simulation.step(globalState, DT);

    let plane = globalState.blue[0];

    // Set camera position
    camera.position.setX(plane.position.x);
    camera.position.setY(plane.position.y);
    camera.position.setZ(plane.position.z);

    // Set camera up vector
    let up = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.rotation);
    camera.up = up;

    // Set camera lookat vector
    let heading = new THREE.Vector3(0, 1, 0).applyQuaternion(plane.rotation);
    heading.add(camera.position);
    camera.lookAt(heading);

    if (count < 10) {
        requestAnimationFrame( animate );
    }
    renderer.render( scene, camera );
}

init();
animate();
