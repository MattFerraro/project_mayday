var THREE = require("three");

var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    // material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    material = new THREE.MeshLambertMaterial({
    	color: 0xCCCCCC
    });

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    var ambientLight = new THREE.AmbientLight(0x202020);
	scene.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff,1);
	directionalLight.position.set(0, 0, 1000);
	scene.add(directionalLight);

    document.body.appendChild( renderer.domElement );
}

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}
