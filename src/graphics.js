var THREE = require("three");
var sphere = 0;

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
    let redMaterial = new THREE.MeshPhongMaterial({ color: 0xDD0000 });
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

    // Add flat plane!
    let flatPlane = new THREE.PlaneGeometry(30, 30);
    for (var i = 0; i < 80; i++) {
        for (var j = 0; j < 80; j++) {
            if (j % 2 == 0 ^ i % 2 == 0) {
                var tile = new THREE.Mesh(flatPlane, yellowMaterial);
            }
            else {
                var tile = new THREE.Mesh(flatPlane, blueMaterial);
            }
            tile.position.setZ(-0.01);
            tile.position.setX((i-25) * 40);
            tile.position.setY((j-25) * 40 - 8000);
            scene.add(tile);
        }
    }

    // let geometry = new THREE.BoxGeometry( 3, 3, 3 );
    let geometry = new THREE.ConeGeometry( .25, 2, 32 );
    sphere = new THREE.Mesh( geometry, redMaterial);
    sphere.position.set(0, -8000, 1);
    scene.add(sphere);

    return scene;
}

function setScene(plane, cameraMode) {
    if (cameraMode === 1) {
        sphere.position.copy(plane.position);
        sphere.quaternion.copy(plane.rotation);
    }
}

function addDashboard(scene, camera) {
    // sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
    // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    let flatPlane = new THREE.PlaneGeometry(20, 20);
    let blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000CC });

    var fixedPlate = new THREE.Mesh( flatPlane, blueMaterial );
    // fixedPlate.position.setX(val);
    // console.log(val);
    // camera.add(fixedPlate);
}

module.exports = {
	buildRenderer: buildRenderer,
	buildCamera: buildCamera,
	buildScene: buildScene,
	addLighting: addLighting,
    addDashboard: addDashboard,
    setScene: setScene
}
