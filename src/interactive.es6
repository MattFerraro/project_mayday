import * as teamRed from "./teamOne";

// import * as teamBlue from "./teamLive";
import * as teamBlue from "./teamTwo";

var simulation = require("./simulation");
var DT = 0.05; // make this more accurate by measuring true FPS
var globalState;

var graphics = require("./graphics");
var THREE = require("three");
var Vector3 = THREE.Vector3;
var $ = require("jquery");

var renderer, camera, scene;
var cameraMode = 1;
var logLevel = 0;
var maxCount = 1000;

function init() {
    // Initialize all the graphics
    renderer = graphics.buildRenderer();
    camera = graphics.buildCamera();
    scene = graphics.buildScene();
    graphics.addLighting(scene);
    document.body.appendChild(renderer.domElement);

    globalState = simulation.initialize(teamRed, teamBlue);

    let plane = globalState.blue[0];
    graphics.addPlane(scene, plane);

    window.onkeypress = keypress;
}

var count = 0;
function animate() {
    simulation.step(globalState, DT, logLevel, "trap");

    let plane = globalState.blue[0];

    if (plane.velocity.length() > 300) {
        maxCount = count;
    }

    if (cameraMode === 0) {
        // Set camera position
        camera.position.copy(plane.position);

        // Set camera up vector
        let up = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.rotation);
        camera.up = up;

        // Set camera lookat vector
        let heading = new THREE.Vector3(0, 1, 0).applyQuaternion(plane.rotation);
        heading.add(camera.position);
        camera.lookAt(heading);
    }
    else if (cameraMode === 1) {
        // FROM OFF RIGHT WING
        // Set camera position
        let rightWing = new Vector3(2, 0, 0).applyQuaternion(plane.rotation).add(plane.position);
        camera.position.copy(rightWing);

        // Set camera up vector
        let up = new THREE.Vector3(0, 0, 1);
        camera.up = up;

        // Set camera lookat vector
        camera.lookAt(plane.position);

        graphics.setScene(plane, cameraMode);
    }
    else if (cameraMode === 2) {
        // FROM ABOVE
        // Set camera position
        let up = new Vector3(0, 0, 3).applyQuaternion(plane.rotation).add(plane.position);
        camera.position.copy(up);

        // Set camera up vector
        let forward = new THREE.Vector3(0, 1, 0);
        camera.up = forward;

        // Set camera lookat vector
        camera.lookAt(plane.position);

        graphics.setScene(plane, cameraMode);
    }

    count+=1;
    if (count < maxCount) {
        requestAnimationFrame( animate );
    }
    else {
        console.log("Done running");
    }
    renderer.render( scene, camera );
}

function keypress(event) {
    if (event.key === 'c') {
        cameraMode += 1;
        if (cameraMode > 2) {
            cameraMode = 0;
        }
    }
    if (event.key === 'w') {
        maxCount += 20;
        animate();
    }
}

init();
animate();
