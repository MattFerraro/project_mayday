var THREE = require("three");
var $ = require("jquery");

var scene, camera, renderer;
var geometry, material, mesh;
var frames = [];
var frameIndex = 0;

init();
grabData(animate);

function buildScene() {
    let yellowMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
    let blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000CC });
    let cementMaterial = new THREE.MeshPhongMaterial({ color: 0x4C4C4C });

    // Cement:
    let rwLength = 2000;
    var runway = new THREE.Mesh(
        new THREE.PlaneGeometry(30, rwLength),
        cementMaterial
    );
    runway.position.setY(-8000);
    scene.add(runway);
    // Center lines:
    let stripeInterval = 10;
    for (var i = 0; i < rwLength / stripeInterval; i ++) {
        var stripe = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 5),
            yellowMaterial
        );
        stripe.position.setZ(0.01);
        stripe.position.setY(i * stripeInterval - rwLength / 2 - 8000);
        scene.add(stripe);
    }
}

function addLighting() {
    var ambientLight = new THREE.AmbientLight(0x202020);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(0, 1000, 1000);
    scene.add(directionalLight);
}

function buildRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function buildCamera() {
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 0, 10);

    let a = new THREE.Vector3(0, 1, 0);
    a.add(camera.position);

    camera.lookAt(a);
}
function init() {
    scene = new THREE.Scene();
    buildCamera();
    buildScene();
    buildRenderer();
    addLighting();

    document.body.appendChild( renderer.domElement );
}

function animate() {
    let frame = frames[frameIndex];
    camera.position.setX(frame[0]);
    camera.position.setY(frame[1]);
    camera.position.setZ(frame[2]);
    console.log(camera.position);

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
