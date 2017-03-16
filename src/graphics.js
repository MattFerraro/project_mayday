var THREE = require("three");
var Vector3 = THREE.Vector3;
var planeSpecs = require('./specs.js').planeSpecs;
var planeMesh = 0;

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
    return scene;
}

function addPlane(scene, plane) {
    let spec = planeSpecs[plane.type];

    let redMaterial = new THREE.MeshPhongMaterial({ color: 0xFF3333 });
    let singleGeometry = new THREE.Geometry();

    function addThing(someGeometry, rotation, position) {
        someMesh = new THREE.Mesh(someGeometry);

        if (typeof(position) !== 'undefined') {
            console.log("have pos");
            console.log(someMesh);
            someMesh.position.copy(position);
        }

        if (typeof(rotation) !== 'undefined') {
            someMesh.quaternion.copy(rotation);
        }

        someMesh.updateMatrix();
        singleGeometry.merge(someMesh.geometry, someMesh.matrix);
    }

    // center of mass
    addThing(new THREE.SphereGeometry(.025, 32, 32));

    // addThing(new THREE.CylinderGeometry( .01, .01, 2, 32 ));

    // landing gear
    for (let gear of spec.gear) {

        let from = new THREE.Vector3(0, 1, 0);
        let to = new THREE.Vector3().copy(gear.position).normalize();
        let rotation = new THREE.Quaternion().setFromUnitVectors(from, to);

        let length = gear.position.length();
        let position = new THREE.Vector3().copy(gear.position).multiplyScalar(0.5);
        position = new THREE.Vector3(0, 0, 0);

        addThing(new THREE.CylinderGeometry(0.01, 0.01, length, 32), rotation, gear.position.clone().multiplyScalar(0.5));
        addThing(new THREE.SphereGeometry(0.020, 16, 16), undefined, gear.position);
    }

    // tail!
    addThing(
        new THREE.CylinderGeometry( .01, .01, spec.tail.length, 32 ),
        undefined,
        new Vector3(0, -spec.tail.length/2, 0));

    // horizontal stab
    addThing(new THREE.BoxGeometry(
            spec.tail.horizStab.width,
            spec.tail.horizStab.chord,
            spec.tail.horizStab.thickness),
        undefined,
        new Vector3(0, -spec.tail.length - spec.tail.horizStab.chord/2, 0));

    // vertical stab
    addThing(new THREE.BoxGeometry(
            spec.tail.vertStab.thickness,
            spec.tail.vertStab.chord,
            spec.tail.vertStab.width),
        undefined,
        new Vector3(0, -spec.tail.length - spec.tail.vertStab.chord/2, spec.tail.vertStab.width / 2));

    // fuselage
    addThing(
        new THREE.CylinderGeometry( .01, .01, spec.fuselage.length, 32 ),
        undefined,
        new Vector3(0, spec.fuselage.length/2, 0));

    // right wing
    let wing = spec.wing;
    let shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, wing.chordRoot);
    shape.lineTo(wing.length, wing.chordRoot - (wing.chordRoot - wing.chordTip) / 2);
    shape.lineTo(wing.length, (wing.chordRoot - wing.chordTip) / 2);
    shape.lineTo(0, 0);

    let extrudeSettings = {
        steps: 2,
        amount: .04,
        bevelEnabled: true,
        bevelThickness: .01,
        bevelSize: .01,
        bevelSegments: 1
    };
    let rightWingGeometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    addThing(rightWingGeometry, undefined, wing.position);

    // left wing
    shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, wing.chordRoot);
    shape.lineTo(-wing.length, wing.chordRoot - (wing.chordRoot - wing.chordTip) / 2);
    shape.lineTo(-wing.length, (wing.chordRoot - wing.chordTip) / 2);
    shape.lineTo(0, 0);

    leftWingGeometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    addThing(leftWingGeometry, undefined, wing.position);

    planeMesh = new THREE.Mesh(singleGeometry, redMaterial);
    scene.add(planeMesh);
}

function setScene(plane, cameraMode) {
    if (cameraMode === 1 || cameraMode === 2) {
        planeMesh.position.copy(plane.position);
        planeMesh.quaternion.copy(plane.rotation);
    }
}

function addDashboard(scene, camera) {
    let flatPlane = new THREE.PlaneGeometry(20, 20);
    let blueMaterial = new THREE.MeshPhongMaterial({ color: 0x0000CC });
    var fixedPlate = new THREE.Mesh( flatPlane, blueMaterial );
}

module.exports = {
	buildRenderer: buildRenderer,
	buildCamera: buildCamera,
	buildScene: buildScene,
	addLighting: addLighting,
    addDashboard: addDashboard,
    setScene: setScene,
    addPlane: addPlane
}
