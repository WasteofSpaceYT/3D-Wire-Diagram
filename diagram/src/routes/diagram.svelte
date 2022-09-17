<script lang="ts">
	import * as THREE from "three";
	//@ts-ignore
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { PerspectiveCamera } from "three";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { onMount } from "svelte";
	let canvas: HTMLCanvasElement;
	const scene = new THREE.Scene();
	let renderer: THREE.WebGLRenderer;
	export let url;
    let walls:THREE.Object3D<THREE.Event>[] = [];
	function assembleScene() {
		
	}
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.0001,
		100
        );
        let floorCorners;
        const raycaster = new THREE.Raycaster();
        
        function render(time: number) {
        requestAnimationFrame(render);
		for(const wall of walls){
				let blockingFloor = false;
                for(const corner of floorCorners){
					raycaster.set(camera.position, corner.clone().sub(camera.position).normalize());
					const intersects = raycaster.intersectObjects([wall], true);
					if(intersects.length > 0){
						blockingFloor = true;
						break;
					}
                }
				wall.visible = !blockingFloor;
            }
			
			renderer.render(scene, camera);
		}
	onMount(() => {
		renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
		const loader = new GLTFLoader();
		loader.load(
			"/room.gltf",
			(room) => {
				for (let i = 0; i < room.scene.children.length; i++) {
					if (room.scene.children[i].name == "Floor") {
						let floor = room.scene.children[i];
						floorCorners = [
							new THREE.Vector3(
								floor.position.x + floor.scale.x - 0.2,
								floor.position.y * 2,
								floor.position.z + floor.scale.z - 0.2
							),
							new THREE.Vector3(
								floor.position.x + floor.scale.x - 0.2,
								floor.position.y * 2,
								floor.position.z - floor.scale.z + 0.2
								),
								new THREE.Vector3(
									floor.position.x - floor.scale.x + 0.2,
									floor.position.y * 2,
									floor.position.z - floor.scale.z + 0.2
									),
									new THREE.Vector3(
										floor.position.x - floor.scale.x + 0.2,
										floor.position.y * 2,
										floor.position.z + floor.scale.z - 0.2
										),
									];
									renderer.setAnimationLoop(render);
					} else if(room.scene.children[i].name.toLowerCase().includes("wall")){
                        walls.push(room.scene.children[i]);
                    }
				}
				scene.add(room.scene);
			},
			console.log,
			console.error
		);
		
		camera.position.z = 10;
		scene.add(camera);
		const controls = new OrbitControls(camera, canvas);
		renderer.setSize(window.innerWidth, window.innerHeight);
		var light = new THREE.DirectionalLight(0xffffff, 10);
		light.castShadow = true;
		scene.add(light);
		renderer.render(scene, camera);
	});
</script>
<h1>{url}</h1>
<canvas bind:this={canvas} style="w-full h-full" />

<svelte:window
	on:resize={() => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}}
/>
