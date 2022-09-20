<script lang="ts">
	// North: width
	// South: -width

	import * as THREE from "three";
	//@ts-ignore
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { CubeCamera, Loader, Mesh, PerspectiveCamera } from "three";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { onMount } from "svelte";
	let canvas: HTMLCanvasElement;
	const scene = new THREE.Scene();
	let renderer: THREE.WebGLRenderer;
	let width;
	let height;
	let placing = false;
	let cube;
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
	let printed = false;
	let floor;
	let NWall;
	let SWall;
	let EWall;
	let WWall;
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

			for (let i = 2; i < intersections.length; i++) {
				if (intersections != undefined) {
					console.log(intersections[i].object.name);
					let point = intersections[i].point;
					cube.position.set(point.x, point.y + 1, point.z);
					cube.rotation.set(
						intersections[i].object.rotation.x,
						intersections[i].object.rotation.y,
						intersections[i].object.rotation.z
					);
				}
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
	const addCube = () => {
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(2.75 / 12, 4.5 / 12, 0.25 / 12),
			new THREE.MeshBasicMaterial({ color: new THREE.Color() })
		);
		placing = true;
		scene.add(cube);
	};
	onMount(() => {
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
		});
		const loader = new GLTFLoader();
		loader.load(
			/*"/receptacle.glb", (receptacles) => {
			renderer.setAnimationLoop(render);
			//@ts-ignore
			console.log(receptacles.scene.children[0].children)
			for(let i = 0; i < receptacles.scene.children[0].children.length; i++){
				//@ts-ignore
				//receptacles.scene.children[0].children[i].material.color = new THREE.Color(0x000000)
			}
			scene.add(receptacles.scene)/
		},*/
			"/room.gltf",
			(room) => {
				for (let i = 0; i < room.scene.children.length; i++) {
					if (room.scene.children[i].name == "Floor") {
						let floorTemp = room.scene.children[i];
						floor = new Mesh(
							new THREE.BoxGeometry(width, 0, height),
							new THREE.MeshBasicMaterial({
								color: new THREE.Color(0x000000),
							})
						);
						NWall = new Mesh(
							new THREE.BoxGeometry(6, 0.05, height),
							new THREE.MeshBasicMaterial({
								color: new THREE.Color(0x000000),
							})
						);
						NWall.position.x = width;
						SWall = new Mesh(
							new THREE.BoxGeometry(6, 0.05, height),
							new THREE.MeshBasicMaterial({
								color: new THREE.Color(0x000000),
							})
						);
						SWall.position.x = -width;
						EWall = new Mesh(
							new THREE.BoxGeometry(6, 0.05, width),
							new THREE.MeshBasicMaterial({
								color: new THREE.Color(0x000000),
							})
						);
						EWall.position.z = height;
						WWall = new Mesh(
							new THREE.BoxGeometry(6, 0.05, width),
							new THREE.MeshBasicMaterial({
								color: new THREE.Color(0x000000),
							})
						);
						WWall.position.z = -height;
						floor.position.set(
							floorTemp.position.x,
							floorTemp.position.y,
							floorTemp.position.z
						);

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
							NWall.rotation.set(
								room.scene.children[i].rotation.x,
								room.scene.children[i].rotation.y,
								room.scene.children[i].rotation.z
							);
						}
						if (room.scene.children[i].name == "SWall") {
							room.scene.children[i].scale.z = height;
							room.scene.children[i].position.x = -width;
							SWall.rotation.set(
								room.scene.children[i].rotation.x,
								room.scene.children[i].rotation.y,
								room.scene.children[i].rotation.z
							);
						}
						if (room.scene.children[i].name == "EWall") {
							room.scene.children[i].scale.z = width;
							room.scene.children[i].position.z = -height;
							EWall.rotation.set(
								room.scene.children[i].rotation.x,
								room.scene.children[i].rotation.y,
								room.scene.children[i].rotation.z
							);
						}
						if (room.scene.children[i].name == "WWall") {
							room.scene.children[i].scale.z = width;
							room.scene.children[i].position.z = height;
							WWall.rotation.set(
								room.scene.children[i].rotation.x,
								room.scene.children[i].rotation.y,
								room.scene.children[i].rotation.z
							);
						}
					}
				}
				scene.add(floor);
				scene.add(NWall);
				scene.add(SWall);
				scene.add(EWall);
				scene.add(WWall);
			},
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
		<button on:click={addCube}>Add Receptacle</button>
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
	<canvas bind:this={canvas} style="w-full h-full" />
</div>
<svelte:window
	on:resize={() => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}}
	on:mousemove={onPointerMove}
/>
