import react, { useRef, useState } from 'react';
import * as THREE from 'three'
import { Raycaster, Vector3 } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import ContextMenu from "@agjs/react-right-click-menu";
import Menu from './contextMenu';
import { GUI } from 'dat.gui'

function Home() {
    const [isMenuShown, setIsMenuShown] = useState(false);
  const ref = useRef();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const geometry = new THREE.BoxGeometry(56.5, .25, 52.5);
    const horizBeamGeometry = new THREE.BoxGeometry(56.5,1.5,3.5)
    const wireGeometry = new THREE.CylinderGeometry(0.0808,0.0808,1);
    const wireMaterial = new THREE.MeshBasicMaterial({color: 0xffff00f});
    const wood = new THREE.MeshBasicMaterial({color: 0xfff0f})
    const ceilingMaterial = new THREE.MeshBasicMaterial({color: "white"})
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const floor = new THREE.Mesh( geometry, material );
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    const ceiling = new THREE.Mesh(geometry, material)
    const horizBeamLeft = new THREE.Mesh(horizBeamGeometry, ceilingMaterial)
    const horizBeamRight = new THREE.Mesh(horizBeamGeometry, ceilingMaterial)
    const horizBeamBack = new THREE.Mesh(horizBeamGeometry, ceilingMaterial)
    const horizBeamFront = new THREE.Mesh(horizBeamGeometry, ceilingMaterial)
    scene.add( floor );
    scene.add( wire );
    scene.add(ceiling)
    scene.add(horizBeamLeft)
    scene.add(horizBeamRight)
    scene.add(horizBeamBack)
    scene.add(horizBeamFront)
    ceiling.position.set(0,92,0)
    horizBeamLeft.position.set(0,47,28.25)
    horizBeamRight.position.set(0,47,-28.25)
    horizBeamBack.rotation.y = Math.PI/2
    horizBeamBack.position.set(-28.25,47,0)
    horizBeamFront.position.set(0,47,28.25)
    const controls = new OrbitControls( camera, renderer.domElement );
    const moveControls = new TransformControls(camera, renderer.domElement)
    moveControls.attach(wire)
    scene.add(moveControls)
    // add event listener to highlight dragged objects
    controls.addEventListener( 'dragstart', function ( event ) {
        event.object.material.emissive.set( 0xaaaaaa );
    } );
    
    controls.addEventListener( 'dragend', function ( event ) {
        event.object.material.emissive.set( 0x000000 );
    } );
    camera.position.z = 5;

    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    };
//const projector = new THREE.Projector();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = 2 * (event.clientX / window.innerWidth) - 1;
	pointer.y = 1 - 2 * ( event.clientY / window.innerHeight );
    //var raycaster = projector.pickingRay( pointer.clone(), camera );
}
moveControls.addEventListener('mouseDown', function () {
    controls.enabled = false;
});
moveControls.addEventListener('mouseUp', function () {
    controls.enabled = true;
});
function render() {

	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i ++ ) {
        //@ts-ignore
		//intersects[ i ].object.material.color.set( 0xff0000 );
        //console.log(intersects[i].object.rotation)
        //moveControls.attach(intersects[i].object)
	}

	renderer.render( scene, camera );

}
render()
//moveControls.attach(horizBeamBack)
window.addEventListener( 'pointermove', onPointerMove );
document.addEventListener( 'mousedown', (e) => {
   render()
} );
window.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'KeyM':
            moveControls.setMode('translate')
            console.log('translate')
            break
        case 'KeyR':
            moveControls.setMode('rotate')
            console.log('rotate')
            break
        case 'KeyS':
            moveControls.setMode('scale')
            console.log('scale')
            break
    }
    console.log(event.code)
})
window.requestAnimationFrame(render);
    animate();



    const gui = new GUI()
const cubeFolder = gui.addFolder('Cube')
cubeFolder.add(floor.rotation, 'x', 0, Math.PI * 2)
cubeFolder.add(floor.rotation, 'y', 0, Math.PI * 2)
cubeFolder.add(floor.rotation, 'z', 0, Math.PI * 2)
cubeFolder.open()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()
        return (
            <div>
            </div>
        )
}

export default Home;