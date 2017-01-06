var THREE = require("three");

// var scene, camera, renderer;
// var geometry, material, mesh;

function addLighting(scene) {
    var ambientLight = new THREE.AmbientLight(0x202020);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff,1);
    directionalLight.position.set(0, 1000, 1000);
    scene.add(directionalLight);
}

function buildRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    return renderer;
}

function buildCamera() {
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 0, 10);

    let a = new THREE.Vector3(0, 1, 0);
    a.add(camera.position);

    camera.lookAt(a);
    return camera;
}

function buildScene() {
	scene = new THREE.Scene();
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
    return scene;
}

module.exports = {
	buildRenderer: buildRenderer,
	buildCamera: buildCamera,
	buildScene: buildScene,
	addLighting: addLighting
}
