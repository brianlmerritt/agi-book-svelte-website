<script lang="ts">
	import * as THREE from 'three';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	// A reactive vector for the mouse position, used for the evasion behavior.
	let mousePosition = new THREE.Vector2();

	onMount(() => {
		if (!canvas) return;

		let animationFrameId: number;

		// --- SCENE SETUP ---
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		// Position the camera further back to see the whole scene
		camera.position.z = 25; 
		
		const renderer = new THREE.WebGLRenderer({ 
			canvas,
			antialias: true,
			alpha: true // Important for a transparent background
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// --- CRYSTAL SHARD GENERATION ---
		const crystals: { mesh: THREE.Mesh; velocity: THREE.Vector3 }[] = [];
		// Define the 3D space where the crystals can move
		const bounds = { x: 50, y: 25, z: 30 };

		// Helper function to create a single crystal
		const createCrystal = (geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, opacity: number) => {
			const material = new THREE.MeshStandardMaterial({
				color: color,
				roughness: 0.2,
				metalness: 0.1,
				transparent: true,
				opacity: opacity,
				// This is the key to the faceted look!
				flatShading: true, 
			});
			const mesh = new THREE.Mesh(geometry, material);
			
			// Set a random starting position and velocity
			mesh.position.set(
				(Math.random() - 0.5) * bounds.x,
				(Math.random() - 0.5) * bounds.y,
				(Math.random() - 0.5) * bounds.z
			);
			const velocity = new THREE.Vector3(
				(Math.random() - 0.5) * 0.02,
				(Math.random() - 0.5) * 0.02,
				(Math.random() - 0.5) * 0.02
			);

			scene.add(mesh);
			crystals.push({ mesh, velocity });
		};

		// Define various crystal shapes
		const diamondGeom = new THREE.OctahedronGeometry(1, 0); // Simple diamond
		const columnGeom = new THREE.CylinderGeometry(0.4, 0.4, 3, 8); // Crystal column
		const hexGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 6); // Hexagonal barrel
		const shardGeom = new THREE.ConeGeometry(0.6, 2.4, 5); // Sharp shard
		const clusterGeom = new THREE.IcosahedronGeometry(1.2, 0); // Polyhedral cluster

		// Instantiate the crystals with different properties
		createCrystal(diamondGeom, 0x9966ff, 0.85); // Amethyst
		createCrystal(columnGeom, 0xffccaa, 0.75);  // Rose Quartz
		createCrystal(hexGeom, 0x66ddff, 0.9);     // Aquamarine
		createCrystal(shardGeom, 0xeeffaa, 0.8);   // Citrine
		createCrystal(clusterGeom, 0xff8888, 0.8); // Red Beryl

		// Add some simple lighting to the scene to see the facets
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
		directionalLight.position.set(5, 10, 7.5);
		scene.add(directionalLight);

		// --- EVENT LISTENERS ---
		const handleMouseMove = (event: MouseEvent) => {
			mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
			mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener('mousemove', handleMouseMove);

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);

		// --- RENDER LOOP ---
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			// --- CRYSTAL MOVEMENT AND EVASION LOGIC ---
			crystals.forEach(crystal => {
				// Evasion force calculation
				const mouse3D = new THREE.Vector3(mousePosition.x * bounds.x / 2, mousePosition.y * bounds.y / 2, camera.position.z);
				const distanceToMouse = crystal.mesh.position.distanceTo(mouse3D);
				
				if (distanceToMouse < 5) { // Evasion radius
					const repulsionForce = new THREE.Vector3().subVectors(crystal.mesh.position, mouse3D).normalize();
					repulsionForce.multiplyScalar((5 - distanceToMouse) * 0.008);
					crystal.velocity.add(repulsionForce);
				}

				// Apply velocity
				crystal.mesh.position.add(crystal.velocity);

				// Bounce off the edges of the defined bounds
				if (Math.abs(crystal.mesh.position.x) > bounds.x / 2) crystal.velocity.x *= -1;
				if (Math.abs(crystal.mesh.position.y) > bounds.y / 2) crystal.velocity.y *= -1;
				if (Math.abs(crystal.mesh.position.z) > bounds.z / 2) crystal.velocity.z *= -1;

				// Add subtle, continuous rotation to each crystal
				crystal.mesh.rotation.x += 0.001;
				crystal.mesh.rotation.y += 0.002;
			});

			renderer.render(scene, camera);
		};
		animate();
		
		// --- CLEANUP ---
		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			
			crystals.forEach(c => {
				scene.remove(c.mesh);
				c.mesh.geometry.dispose();
				(c.mesh.material as THREE.Material).dispose();
			});
			renderer.dispose();
		};
	});
</script>

<!-- The canvas is styled to be a fixed element on top of other content -->
<canvas 
	bind:this={canvas} 
	class="fixed top-0 left-0 w-full h-full z-10 pointer-events-none"
></canvas>
