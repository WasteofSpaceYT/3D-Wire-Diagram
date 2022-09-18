<script lang="ts">
	// North: width
	// South: -width

	import * as THREE from "three";
	//@ts-ignore
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Loader, PerspectiveCamera } from "three";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { onMount } from "svelte";
	let canvas: HTMLCanvasElement;
	const scene = new THREE.Scene();
	let renderer: THREE.WebGLRenderer;
	let width;
	let height;
	let placing = false;
	let url = location.href;
	try {
		let params = url.split("?")[1].split("&");
		if (params.length != 2) {
			alert("Invalid arguments");
		}
		if (
			params[0].split("=")[0] != "width" ||
			params[1].split("=")[0] != "height"
		) {
			alert("Invalid arguments");
		}
		if (
			params[0].split("=")[0] != "width" ||
			(params[1].split("=")[0] != "height" && params.length == 2)
		) {
			width = 5;
			height = 5;
		} else {
			width = parseInt(params[0].split("=")[1]);
			height = parseInt(params[1].split("=")[1]);
		}
	} catch (err) {
		width = 5;
		height = 5;
	}
	let walls: THREE.Object3D<THREE.Event>[] = [];
	function assembleScene() {}
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.0001,
		100
	);
	let floorCorners;
	const raycaster = new THREE.Raycaster();
	const pointerRaycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	function onPointerMove(event) {
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	function render(time: number) {
		requestAnimationFrame(render);
		if (placing) {
			pointerRaycaster.setFromCamera(pointer, camera);

			const intersections = pointerRaycaster.intersectObjects(
				scene.children
			);

			for (let i = 0; i < intersections.length; i++) {
				let point = intersections[i].point;
			}
		}
		for (const wall of walls) {
			let blockingFloor = false;
			for (const corner of floorCorners) {
				raycaster.set(
					camera.position,
					corner.clone().sub(camera.position).normalize()
				);
				const intersects = raycaster.intersectObjects([wall], true);
				if (intersects.length > 0) {
					blockingFloor = true;
					break;
				}
			}
			wall.visible = !blockingFloor;
		}

		renderer.render(scene, camera);
	}
	onMount(() => {
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
		});
		const loader = new GLTFLoader();
		loader.load("/receptacle.glb", (receptacles) => {
			renderer.setAnimationLoop(render);
			for(let i = 0; i < receptacles.scene.children.length; i++){
				//@ts-ignore
				console.log(receptacles.scene.children[i])
			}
			scene.add(receptacles.scene)
		},
			//"/room.gltf",
			/*(room) => {
				for (let i = 0; i < room.scene.children.length; i++) {
					if (room.scene.children[i].name == "Floor") {
						let floor = room.scene.children[i];
						floor.scale.setX(width);
						floor.scale.setZ(height);
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
					} else if (
						room.scene.children[i].name
							.toLowerCase()
							.includes("wall")
					) {
						walls.push(room.scene.children[i]);
						if (room.scene.children[i].name == "NWall") {
							room.scene.children[i].scale.z = height;
							room.scene.children[i].position.x = width;
						}
						if (room.scene.children[i].name == "SWall") {
							room.scene.children[i].scale.z = height;
							room.scene.children[i].position.x = -width;
						}
						if (room.scene.children[i].name == "EWall") {
							room.scene.children[i].scale.z = width;
							room.scene.children[i].position.z = -height;
						}
						if (room.scene.children[i].name == "WWall") {
							room.scene.children[i].scale.z = width;
							room.scene.children[i].position.z = height;
						}
					}
				}
				scene.add(room.scene);
			},*/
			console.log,
			console.error
			);


		camera.position.z = 10;
		camera.rotation.z = Math.PI;
		scene.add(camera);
		const controls = new OrbitControls(camera, canvas);
		controls.enablePan = false;
		renderer.setSize(window.innerWidth, window.innerHeight);
		var light = new THREE.DirectionalLight(0xffffff, 10);
		light.castShadow = true;
		scene.add(light);
		renderer.render(scene, camera);
	});
</script>
<div>
		<div class="scroll">
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	<button>Add Receptacle</button>
	</div>
<canvas bind:this={canvas} style="w-full h-full">
</canvas>
</div>
<svelte:window
	on:resize={() => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}}
	on:mousemove={onPointerMove}
/>
