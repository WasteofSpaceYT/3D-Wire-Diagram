<script lang="ts">
	// North: width
	// South: -width

	// Imports
	import * as THREE from "three";
	//@ts-ignore
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { CubeCamera, Loader, Mesh, PerspectiveCamera } from "three";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { onMount } from "svelte";
	import { initializeApp } from "firebase/app";
	import { getAuth } from "firebase/auth";

	// Initialize firebase
	const firebaseConfig = {
		apiKey: "AIzaSyA3w93rWAwPFTHpnuGgmnWEFhsiwJkRpGY",
		authDomain: "wiringdiagram3d.firebaseapp.com",
		projectId: "wiringdiagram3d",
		storageBucket: "wiringdiagram3d.appspot.com",
		messagingSenderId: "322663865877",
		appId: "1:322663865877:web:eb33bb9fe16a291137781c",
		measurementId: "G-P1PXBXCXHF",
	};
	const app = initializeApp(firebaseConfig);
	const auth = getAuth();

	// Variables
	let canvas: HTMLCanvasElement;
	const scene = new THREE.Scene();
	let renderer: THREE.WebGLRenderer;
	let userToggled = false;
	let width;
	let height;
	let length;
	let placing = false;
	let cube;
	let floorCorners;
	let wallHeight = 9;
	let showing = "Floor";
	let navShow = "Receptacles";
	let floor;
	let NWall;
	let SWall;
	let EWall;
	let WWall;
	let NSRot = new THREE.Euler(0, 0, Math.PI / 2);
	let EWRot = new THREE.Euler(Math.PI / 2, Math.PI / 2, 0);

	// Raycasters for object placement and wall hiding
	const raycaster = new THREE.Raycaster();
	const pointerRaycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	// Get the room size from the url
	let url = location.href;
	try {
		let params = url.split("?")[1].split("&");
		if (params.length != 3) {
			alert("Invalid arguments");
		}
		if (
			params[0].split("=")[0] != "width" ||
			params[1].split("=")[0] != "length" ||
			params[2].split("=")[0] != "height"
		) {
			alert("Invalid arguments");
		}
		if (
			params[0].split("=")[0] != "width" ||
			params[1].split("=")[0] != "length" ||
			(params[2].split("=")[0] != "height" && params.length == 3)
		) {
			width = 5;
			length = 10;
			height = 9;
		} else {
			width = parseInt(params[0].split("=")[1]);
			length = parseInt(params[1].split("=")[1]);
			height = parseInt(params[2].split("=")[1]);
		}
	} catch (err) {
		width = 5;
		length = 10;
		height = 9;
	}

	// Empty wall array
	let walls: THREE.Object3D<THREE.Event>[] = [];

	// Create camera
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.0001,
		100
	);

	// change ponter position for object placement raycasting
	function onPointerMove(event) {
		pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
	// Animation loop render
	function render(time: number) {
		requestAnimationFrame(render);
		// Object placement raycasting
		if (placing) {
			pointerRaycaster.setFromCamera(pointer, camera);

			const intersections = pointerRaycaster.intersectObjects(
				scene.children
			);

			for (let i = 0; i < intersections.length; i++) {
				if (intersections != undefined) {
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
		// Wall hiding raycasting
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
	// Add receptacle to scene
	const addCube = () => {
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(2.75 / 12, 4.5 / 12, 0.25 / 12),
			new THREE.MeshBasicMaterial({ color: new THREE.Color() })
		);
		placing = true;
		scene.add(cube);
	};
	onMount(() => {
		// Create renderer
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
		});

		// Create floor and walls
		floor = new Mesh(
			new THREE.BoxGeometry(width, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x808080),
			})
		);
		NWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x000000),
			})
		);
		NWall.position.x = width / 2;
		SWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x000000),
			})
		);
		SWall.position.x = -width / 2;
		EWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, width),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x000000),
			})
		);
		EWall.position.z = length / 2;
		WWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, width),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x000000),
			})
		);
		WWall.position.z = -length / 2;

		// Set the floor corners for wall hiding
		floorCorners = [
			new THREE.Vector3(
				floor.position.x + floor.scale.x * 2,
				floor.position.y * 2,
				floor.position.z + floor.scale.z * 2
			),
			new THREE.Vector3(
				floor.position.x + floor.scale.x * 2,
				floor.position.y * 2,
				floor.position.z - floor.scale.z * 2
			),
			new THREE.Vector3(
				floor.position.x - floor.scale.x * 2,
				floor.position.y * 2,
				floor.position.z - floor.scale.z * 2
			),
			new THREE.Vector3(
				floor.position.x - floor.scale.x * 2,
				floor.position.y * 2,
				floor.position.z + floor.scale.z * 2
			),
		];
		renderer.setAnimationLoop(render);
		// Set object names
		floor.name = "Floor";
		NWall.name = "NWall";
		SWall.name = "SWall";
		EWall.name = "EWall";
		WWall.name = "WWall";
		// Rotation
		NWall.rotation.set(NSRot.x, NSRot.y, NSRot.z);
		SWall.rotation.set(NSRot.x, NSRot.y, NSRot.z);
		EWall.rotation.set(EWRot.x, EWRot.y, EWRot.z);
		WWall.rotation.set(EWRot.x, EWRot.y, EWRot.z);
		// Position
		NWall.position.y = height / 2;
		SWall.position.y = height / 2;
		EWall.position.y = height / 2;
		WWall.position.y = height / 2;

		walls = [NWall, SWall, EWall, WWall];

		// Add objects to scene
		scene.add(floor);
		scene.add(NWall);
		scene.add(SWall);
		scene.add(EWall);
		scene.add(WWall);

		// Set camera position and rotation, then add to scene
		camera.position.z = 10;
		camera.position.y = 15;
		camera.rotation.z = new THREE.Euler(0, 0, Math.PI / 4).z;
		scene.add(camera);

		// Add camera controls
		const controls = new OrbitControls(camera, canvas);
		controls.enablePan = false;

		renderer.setSize(window.innerWidth, window.innerHeight);

		// Add lights
		var light = new THREE.AmbientLight(0xffffff, 10);
		light.castShadow = true;
		scene.add(light);

		renderer.render(scene, camera);
	});
</script>

<div>
	<div style="position: absolute">
		<img
			src="/favicon.png"
			alt=""
			on:click={() => {
				userToggled = !userToggled;
			}}
		/>
		<div style="float: right">
			<br />
			<div hidden={!userToggled}>
				<div hidden={auth.currentUser == null}>
					<h1>
						{auth.currentUser != null
							? auth.currentUser.displayName
							: ""}
					</h1>
					<button class="navButton">New Project</button>
					<button class="navButton">Save Project</button>
					<button class="navButton">Load Project</button>
					<button class="navButton">View Projects</button>
					<button class="navButton">Logout</button>
				</div>
				<div hidden={!(auth.currentUser == undefined)}>
					<button class="navButton" href="/login">Login</button>
					<button class="navButton" href="/signup">Signup</button>
				</div>
			</div>
		</div>
		<div>
			<button
				on:click={() => {
					navShow = "receptacles";
				}}>Receptacles</button
			>
			<button
				on:click={() => {
					navShow = "switches";
				}}>Switches</button
			>
			<button
				on:click={() => {
					navShow = "lights";
				}}>Lights</button
			>
		</div>
		<div hidden={navShow != "receptacles" ? true : false}>
			<button on:click={addCube}>Duplex</button>
			<button on:click={addCube}>Quad</button>
			<button on:click={addCube}>Duplex (Decora)</button>
			<button on:click={addCube}>Quad (Decora)</button>
		</div>
		<div hidden={navShow != "switches" ? true : false}>
			<button on:click={addCube}>Single</button>
			<button on:click={addCube}>Double</button>
			<button on:click={addCube}>Single (Decora)</button>
			<button on:click={addCube}>Double (Decora)</button>
		</div>
		<form>
			<input
				type="radio"
				name="options"
				checked
				id="1"
				on:click={() => {
					showing = "Floor";
				}}
			/>Floor
			<input
				type="radio"
				name="options"
				id="2"
				on:click={() => {
					showing = "Ceiling";
				}}
			/>Ceiling
		</form>
	</div>
	<canvas bind:this={canvas} style="w-full h-full" />
</div>
<svelte:window
	on:resize={() => {
		// Update camera aspect ratio and renderer size
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}}
	on:mousemove={onPointerMove}
/>
