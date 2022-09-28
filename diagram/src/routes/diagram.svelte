<script lang="ts">
	// North: width
	// South: -width

	// Imports
	import * as THREE from "three";
	//@ts-ignore
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Box3, CubeCamera, Loader, Mesh, PerspectiveCamera } from "three";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
	import { onMount } from "svelte";
	import { initializeApp } from "firebase/app";
	import { getAuth } from "firebase/auth";
    import Login from "./login.svelte";

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
	let dragging: boolean = false;
	let canvas: HTMLCanvasElement;
	const scene = new THREE.Scene();
	let renderer: THREE.WebGLRenderer;
	let placingObjName: string;
	let userToggled = false;
	let width: number;
	let height: number;
	let length: number;
	let placing: boolean = false;
	let cube: THREE.Mesh;
	let floorCorners: THREE.Vector3[];
	let wallHeight = 9;
	let showing: "Floor" | "Ceiling" = "Floor";
	let navShow: "receptacles" | "switches" | "lights" = "receptacles";
	let floor: Mesh;
	let NWall: Mesh;
	let SWall: Mesh;
	let EWall: Mesh;
	let WWall: Mesh;
	let placingWall: Mesh;
	let NWallBB: THREE.Box3;
	let SWallBB: THREE.Box3;
	let EWallBB: THREE.Box3;
	let WWallBB: THREE.Box3;
	let placingBB: THREE.Box3;
	let floorBB: THREE.Box3;
	let NSRot: THREE.Euler = new THREE.Euler(0, 0, Math.PI / 2);
	let EWRot: THREE.Euler = new THREE.Euler(Math.PI / 2, Math.PI / 2, 0);

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
		dragging = true;
	}
	// Animation loop render
	function render(time: number) {
		requestAnimationFrame(render);
		//console.log(placing)
		// Object placement raycasting
		if (placing) {
			pointerRaycaster.setFromCamera(pointer, camera);

			const intersections = pointerRaycaster.intersectObjects(
				scene.children
			);

			for (let i = 0; i < intersections.length; i++) {
				if (intersections != undefined) {
					let point = intersections[i].point;
					let lastPoint = cube.position;
					cube.position.set(point.x, point.y + 1, point.z);
					if (NWallBB.intersectsBox(placingBB)) {
						placingWall = NWall;
						console.log("Here");
					}
					if (SWallBB.intersectsBox(placingBB)) {
						placingWall = SWall;
						console.log("Here");
					}
					if (EWallBB.intersectsBox(placingBB)) {
						placingWall = EWall;
						console.log("Here");
					}
					if (WWallBB.intersectsBox(placingBB)) {
						placingWall = WWall;
						console.log("Here");
					}
					if(floorBB.intersectsBox(placingBB)){
						break
					}
					/*for (let wall of walls) {
						switch (wall.name) {
							case "NWall":
								if (NWallBB.intersectsBox(placingBB)) {
									placingWall = NWall;
									console.log("Here");
								}
								break;
							case "SWall":
								if (SWallBB.intersectsBox(placingBB)) {
									placingWall = SWall;
									console.log("Here");
								}
								break;
							case "EWall":
								if (EWallBB.intersectsBox(placingBB)) {
									placingWall = EWall;
									console.log("Here");
								}
								break;
							case "WWall":
								if (WWallBB.intersectsBox(placingBB)) {
									placingWall = WWall;
									console.log("Here");
								}
								break;
						}
					}*/
					if (!placingWall) {
						cube.position.set(
							lastPoint.x,
							lastPoint.y,
							lastPoint.z
						);
					}
				}
			}
			if (placingWall) {
				cube.rotation.set(
					placingWall.rotation.x,
					placingWall.rotation.y,
					placingWall.rotation.z
				);
			}
			placingWall = undefined;
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
	const addCube = (device: "receptacleduplex" | "switch" | "switchduplex" | "receptaclequad" | "light" | "florescent", decora: boolean) => {
		if(placing){
			scene.remove(cube)
			//@ts-expect-error
			scene.remove(placingBB)
		}
		const loader = new THREE.TextureLoader();
		let texture: THREE.Texture;
		switch(device){
			case("receptacleduplex"):
		texture = loader.load(decora ? "duplexDecora.jpg" : "duplex.jpg");
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(2.75 / 12, 4.5 / 12, 0.25 / 12),
			new THREE.MeshBasicMaterial({
				map: texture,
			})
		);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		case("receptaclequad"):
		texture = loader.load(decora ? "receptacleQuadDecora.jpg" : "receptacleQuad.jpg");
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(4.5 / 12, 4.5 / 12, 0.25 / 12),
			new THREE.MeshBasicMaterial({
				map: texture,
			})
		);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		case("switch"):
		texture = loader.load(decora ? "switchDecora.jpg" : "switch.jpg");
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(2.75 / 12, 4.5 / 12, 0.25 / 12),
			new THREE.MeshBasicMaterial({
				map: texture,
			})
		);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		case("switchduplex"):
		texture = loader.load(decora ? "switchDuplexDecora.jpg" : "switchDuplex.jpg");
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(4.5 / 12, 4.5 / 12, 0.25 / 12),
			new THREE.MeshBasicMaterial({
				map: texture,
			})
		);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		case("light"):
		texture = loader.load("light.jpg");
		cube = new THREE.Mesh(
			new THREE.CylinderGeometry(2.75 / 12, 2.75 / 12, 0.5 / 12),
			new THREE.MeshBasicMaterial({
				map: texture,
			})
		);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		case("florescent"):
		texture = loader.load("florescent.jpg");
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(24 / 12, 48 / 12, 2 / 12),
			new THREE.MeshBasicMaterial({
				map: texture,
			})
		);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		}
		//@ts-expect-error
		scene.add(placingBB)
	};
	onMount(() => {
		// Load texture for floor
		let floormat: THREE.MeshBasicMaterial;
		let loader = new THREE.TextureLoader();
		let texture = loader.load("/floor.jpg");
		floormat = new THREE.MeshBasicMaterial({
			map: texture,
		});
		console.log("done");
		// Create renderer
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true,
		});

		// Create floor and walls
		floor = new Mesh(new THREE.BoxGeometry(width, 0.05, length), floormat);
		NWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x808080),
			})
		);
		NWall.position.x = width / 2;
		SWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x808080),
			})
		);
		SWall.position.x = -width / 2;
		EWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, width),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x808080),
			})
		);
		EWall.position.z = length / 2;
		WWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, width),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x808080),
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
		console.log("gay");
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

		// Add bounding boxes for placing collision
		NWallBB = new THREE.Box3().setFromObject(NWall);
		SWallBB = new THREE.Box3().setFromObject(SWall);
		EWallBB = new THREE.Box3().setFromObject(EWall);
		WWallBB = new THREE.Box3().setFromObject(WWall);

		// Add objects to scene
		//@ts-expect-error
		scene.add(NWallBB)
		//@ts-expect-error
		scene.add(SWallBB)
		//@ts-expect-error
		scene.add(EWallBB)
		//@ts-expect-error
		scene.add(WWallBB)

		// Add objects to scene
		scene.add(floor);
		scene.add(NWall);
		scene.add(SWall);
		scene.add(EWall);
		scene.add(WWall);

		// Create collision box for floor
		floorBB = new THREE.Box3().setFromCenterAndSize(
			new THREE.Vector3(0, -floor.scale.y, 0),
			new THREE.Vector3(
				floor.scale.x * 2,
				floor.scale.y * 2,
				floor.scale.z * 2
			)
		);

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
		var light = new THREE.AmbientLight(0xffffff, 2);
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
			<button on:click={() => {addCube("receptacleduplex", false)}}>Duplex</button>
			<button on:click={() => {addCube("receptaclequad", false)}}>Quad</button>
			<button on:click={() => {addCube("receptacleduplex", true)}}>Duplex (Decora)</button>
			<button on:click={() => {addCube("receptaclequad", true)}}>Quad (Decora)</button>
		</div>
		<div hidden={navShow != "switches" ? true : false}>
			<button on:click={() => {addCube("switch", false)}}>Single</button>
			<button on:click={() => {addCube("switchduplex", false)}}>Double</button>
			<button on:click={() => {addCube("switch", true)}}>Single (Decora)</button>
			<button on:click={() => {addCube("switchduplex", true)}}>Double (Decora)</button>
		</div>
		<div hidden={navShow != "lights" ? true : false}>
			<button on:click={() => {addCube("light", false)}}>LED</button>
			<button on:click={() => {addCube("florescent", false)}}>Florescent</button>
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
	on:click={(e) => {
		console.log(dragging)
		console.log(e.target)
		if(placing && e.target == canvas && !dragging){
			console.log("here")
			console.log(dragging)
			placing = false;
		}
	}}
	on:mouseup={() => {
		setTimeout(() =>{
		dragging = false;
		}, 2000)
	}}
/>
