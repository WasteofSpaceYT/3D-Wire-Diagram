<script lang="ts">
	import * as THREE from "three"
	//@ts-ignore
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
	import { PerspectiveCamera,  } from "three"
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
	import {onMount} from "svelte"
	let canvas: HTMLCanvasElement
	const scene = new THREE.Scene();
	let renderer: THREE.WebGLRenderer
	const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.0001, 100 );
	onMount(() => {
        renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
        const loader = new GLTFLoader();
        loader.load('/room.gltf', (room) => {
            room.scene.castShadow = true;
            for(let i = 0; i < room.scene.children.length; i++) {
                console.log(room.scene.children[i].type)
                // @ts-ignore
                if(room.scene.children[i].type === "Mesh") {
                    // @ts-ignore
                    room.scene.children[i].material!.color.r = 210
                    // @ts-ignore
                    room.scene.children[i].material!.color.g = 180
                    // @ts-ignore
                    room.scene.children[i].material!.color.b = 140
                }
            }
            scene.add(room.scene)
        }, console.log, console.error)
		function render(time: number){
			requestAnimationFrame(render)
			renderer.render(scene, camera)
		}
camera.position.z = 10;
scene.add(camera)
const controls = new OrbitControls(camera, canvas);
renderer.setSize( window.innerWidth, window.innerHeight );


const floor = new THREE.Mesh(
	new THREE.BoxGeometry( 5, 0.02, 5 ),
	new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
)
floor.name = "floor"
scene.background = new THREE.Color( "#f111111" );
//scene.add( floor );
var light = new THREE.DirectionalLight( 0xffffff, 10 );
light.castShadow = true;
scene.add(light);
console.log(scene.children)
renderer.render( scene, camera );
renderer.setAnimationLoop(render)
	})
</script>

<canvas bind:this={canvas} style="w-full h-full" />

<svelte:window on:resize={() => {
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}} />