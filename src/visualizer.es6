var graphics = require("./graphics");
var THREE = require("three");
var $ = require("jquery");

var frames = [];
var frameIndex = 0;

var renderer;
var camera;
var scene;

init();
grabData(animate);

function init() {
    renderer = graphics.buildRenderer();
    camera = graphics.buildCamera();
    scene = graphics.buildScene();
    graphics.addLighting(scene);
    document.body.appendChild( renderer.domElement );
}

function animate() {
    let frame = frames[frameIndex];
    // Set camera position
    camera.position.setX(frame[0]);
    camera.position.setY(frame[1]);
    camera.position.setZ(frame[2]);

    // Set camera up vector
    camera.up = new THREE.Vector3(frame[9], frame[10], frame[11]);

    let a = new THREE.Vector3(frame[6], frame[7], frame[8]);
    a.add(camera.position);
    camera.lookAt(a);

    // camera.position.y += 1.5;
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    // console.log(frameIndex);
    frameIndex += 1;
}

function grabData(callback) {
    $.get("../plane.dat", function(data) {
        data = data.trim();
        for (let line of data.split("\n")) {
            let entries = line.split("\t");
            let parsed = entries.map(function(x) { return parseFloat(x); });
            frames.push(parsed);
        }
        callback();
    });
}
