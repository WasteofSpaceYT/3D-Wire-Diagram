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
	let floorMaterial: string = "wood1";
	let width: number;
	let height: number;
	let length: number;
	let placing: boolean = false;
	let cube: THREE.Mesh;
	let floorCorners: THREE.Vector3[];
	let ceilingCorners: THREE.Vector3[];
	let theCorners: THREE.Vector3[];
	let wallColor: string | string[] = "#808080"
	let wallHeight: number = 9;
	let showing: "Floor" | "Ceiling" = "Floor";
	let navShow: "receptacles" | "switches" | "lights" = "receptacles";
	let floor: Mesh;
	let ceiling: Mesh;
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

	// Unused type interface just for reference
	interface urlParams {
		width: number;
		length: number;
		height: number;
		floor: string;
		wallColor: string | string[];
	}

	// Raycasters for object placement and wall hiding
	const raycaster = new THREE.Raycaster();
	const pointerRaycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	// Get the room size from the url
	let url = location.href;
	try {
		let params = url.split("?")[1].split("&");
		if (params.length != 5) {
			alert("Invalid arguments");
		}
		if (
			params[0].split("=")[0] != "width" ||
			params[1].split("=")[0] != "length" ||
			params[2].split("=")[0] != "height" ||
			params[3].split("=")[0] != "floor" ||
			params[4].split("=")[0] != "wallColor"
		) {
			alert("Invalid arguments");
		}
		if (
			params[0].split("=")[0] != "width" ||
			params[1].split("=")[0] != "length" ||
			params[3].split("=")[0] != "floor" ||
			params[4].split("=")[0] != "wallColor" ||
			(params[2].split("=")[0] != "height" && params.length == 5)
		) {
			width = 5;
			length = 10;
			height = 9;
			floorMaterial = "wood1";
			wallColor = ["#808080", "#808080", "#808080", "#808080"];
		} else {
			width = parseInt(params[0].split("=")[1]);
			length = parseInt(params[1].split("=")[1]);
			height = parseInt(params[2].split("=")[1]);
			floorMaterial = params[3].split("=")[1];
			if(params[4].split("=")[1].startsWith("#")){
				console.log(wallColor)
				wallColor = [params[4].split("=")[1], params[4].split("=")[1], params[4].split("=")[1], params[4].split("=")[1]];
			} else if(params[4].split("=")[1].startsWith("[")){
				wallColor = params[4].split("=")[1].replace("[", "").replace("]", "").replaceAll("%22", "").split(",");
				console.log(wallColor)
			}
		}
	} catch (err) {
		width = 5;
		length = 10;
		height = 9;
		floorMaterial = "wood1";
		wallColor = ["#808080", "#808080", "#808080", "#808080"]
	}
	console.log(typeof wallColor)
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
		if (placing) {
			pointerRaycaster.setFromCamera(pointer, camera);

			const intersections = pointerRaycaster.intersectObjects(
				scene.children
			);

			for (let i = 0; i < intersections.length; i++) {
				if (intersections != undefined && intersections[i].object.visible && intersections[i].object.type != "Box3Helper") {
					if(intersections[i].object.name == "Floor" && floorBB.intersectsBox(placingBB)) { console.log("Get Floored")
				break;
			} else {console.log(intersections[i].object.name)
					let point = intersections[i].point;
					let lastPoint = cube.position;
					cube.position.set(point.x, point.y, point.z);
					placingBB.setFromObject(cube)
					if (NWallBB.intersectsBox(placingBB)) {
						placingWall = NWall;
						//console.log("NWall");
					}
					if (SWallBB.intersectsBox(placingBB)) {
						placingWall = SWall;
						//console.log("SWall");
					}
					if (EWallBB.intersectsBox(placingBB)) {
						placingWall = EWall;
						//console.log("EWall");
					}
					if (WWallBB.intersectsBox(placingBB)) {
						placingWall = WWall;
						//console.log("WWall");
					}
					if(floorBB.intersectsBox(placingBB)){
						//console.log("Floor")
						break
					}
					for (let wall of walls) {
						switch (wall.name) {
							case "NWall":
								if (NWallBB.intersectsBox(placingBB)) {
									placingWall = NWall;
									console.log("");
								}
								break;
							case "SWall":
								if (SWallBB.intersectsBox(placingBB)) {
									placingWall = SWall;
									console.log("");
								}
								break;
							case "EWall":
								if (EWallBB.intersectsBox(placingBB)) {
									placingWall = EWall;
									console.log("");
								}
								break;
							case "WWall":
								if (WWallBB.intersectsBox(placingBB)) {
									placingWall = WWall;
									console.log("");
								}
								break;
						}
					}
				}
			}
			if (placingWall) {
				if(placingWall.name == "NWall" || placingWall.name == "SWall"){
					cube.rotation.set(cube.rotation.x, Math.PI/2, cube.rotation.z);
				} else if(placingWall.name == "EWall" || placingWall.name == "WWall"){
					cube.rotation.set(cube.rotation.x, Math.PI, EWRot.z);
				}
			}
			placingWall = undefined;
		}}
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
		for(const corner of floorCorners){
			let blockingFloor = false;
			raycaster.set(
				camera.position,
				corner.clone().sub(camera.position).normalize()
			);
			const intersects = raycaster.intersectObjects([ceiling], true);
			if(intersects.length > 0){
				blockingFloor = true;
				break;
			}
			floor.visible = !blockingFloor;
		}
		for(const corner of ceilingCorners){
			let blockingCeiling = false;
			raycaster.set(camera.position, corner.clone().sub(camera.position).normalize());
			const intersects = raycaster.intersectObjects([floor], true);
			if(intersects.length > 0){
				blockingCeiling = true;
				break;
			}
			floor.visible = !blockingCeiling;
		}

		renderer.render(scene, camera);
	}
	// Add receptacle to scene
	const addCube = (device: "receptacleduplex" | "switch" | "switchduplex" | "receptaclequad" | "light" | "florescent", decora: boolean) => {
		if(placing){
			scene.remove(cube)
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
		cube.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
		placing = true;
		placingBB = new Box3().setFromObject(cube);
		scene.add(cube);
		break;
		}
		let placingBBHelper = new THREE.Box3Helper(placingBB, new THREE.Color(0xffff00));
		scene.add(placingBBHelper)
	};
	onMount(() => {
		// Load texture for floor
		let floormat: THREE.MeshBasicMaterial;
		let loader = new THREE.TextureLoader();
		let texture = loader.load(`/${floorMaterial}.jpg`);
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
		ceiling = new Mesh(new THREE.BoxGeometry(width - 0.1, 0.05, length - 0.1), new THREE.MeshBasicMaterial({ color: new THREE.Color() }));
		NWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(wallColor[0]),
			})
		);
		NWall.position.x = width / 2;
		SWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, length),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(wallColor[1]),
			})
		);
		SWall.position.x = -width / 2;
		EWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, width),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(wallColor[2]),
			})
		);
		EWall.position.z = length / 2;
		WWall = new Mesh(
			new THREE.BoxGeometry(height, 0.05, width),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(wallColor[3]),
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

		// Set the ceiling corners for wall hiding
		ceilingCorners = [
			new THREE.Vector3(
				floor.position.x + floor.scale.x * 2,
				height,
				floor.position.z + floor.scale.z * 2
			),
			new THREE.Vector3(
				floor.position.x + floor.scale.x * 2,
				height,
				floor.position.z - floor.scale.z * 2
			),
			new THREE.Vector3(
				floor.position.x - floor.scale.x * 2,
				height,
				floor.position.z - floor.scale.z * 2
			),
			new THREE.Vector3(
				floor.position.x - floor.scale.x * 2,
				height,
				floor.position.z + floor.scale.z * 2
			),
		];
		for(const corner of ceilingCorners) {
			let theSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({color: new THREE.Color(0xff0000)}))
			theSphere.position.set(corner.x, corner.y, corner.z)
			scene.add(theSphere)
		}
		theCorners = Array.prototype.concat(floorCorners, ceilingCorners);
		renderer.setAnimationLoop(render);
		// Set object names
		floor.name = "Floor";
		ceiling.position.y = height;
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

		// Add bounding boxes for debug
		let NWallBBHelper = new THREE.Box3Helper(NWallBB, new THREE.Color(0xffff00));
		let SWallBBHelper = new THREE.Box3Helper(SWallBB, new THREE.Color(0xffff00));
		let EWallBBHelper = new THREE.Box3Helper(EWallBB, new THREE.Color(0xffff00));
		let WWallBBHelper = new THREE.Box3Helper(WWallBB, new THREE.Color(0xffff00));
		scene.add(NWallBBHelper, SWallBBHelper, EWallBBHelper, WWallBBHelper);


		// Add objects to scene
		scene.add(floor);
		scene.add(NWall);
		scene.add(SWall);
		scene.add(EWall);
		scene.add(WWall);
		scene.add(ceiling)

		// Create collision box for floor
		floor.geometry.computeBoundingBox();
		floorBB = new THREE.Box3()
		floorBB.copy( floor.geometry.boundingBox ).applyMatrix4( floor.matrixWorld );
		let floorbbHelper = new THREE.Box3Helper(floorBB, new THREE.Color(0xffff00));
		scene.add(floorbbHelper);

		// Set camera position and rotation, then add to scene
		camera.position.z = 10;
		camera.position.y = 15;
		camera.position.x = 10
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
