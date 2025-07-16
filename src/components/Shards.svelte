<script lang="ts">
	import * as THREE from 'three';
	import { gsap } from 'gsap';

	let canvas: HTMLCanvasElement;

	// Reactive state for the raw mouse position
	let mousePosition = $state({ x: 0, y: 0 });

	// FIX: A plain object to hold the interpolated (smoothed) mouse position.
	// GSAP will animate this object's properties.
	const smoothedMouse = { x: 0, y: 0 };

	// This effect manages the mousemove event listener.
	$effect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
			mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener('mousemove', handleMouseMove);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	});

	// FIX: This new effect watches for changes in the raw mouse position
	// and triggers a smooth animation on the 'smoothedMouse' object.
	$effect(() => {
		gsap.to(smoothedMouse, {
			x: mousePosition.x,
			y: mousePosition.y,
			duration: 0.5, // Controls how quickly the "smoothed" mouse catches up
			ease: 'power2.out',
		});
	});

	// This effect handles the entire Three.js lifecycle.
	$effect(() => {
		if (!canvas) return;

		let animationFrameId: number;

		// --- SCENE SETUP ---
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 25; 
		
		const renderer = new THREE.WebGLRenderer({ 
			canvas,
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// --- CRYSTAL SHARD GENERATION ---
		const crystals: { mesh: THREE.Mesh; velocity: THREE.Vector3 }[] = [];
		const bounds = { x: 50, y: 25, z: 30 };

		const createCrystal = (geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, opacity: number) => {
			const material = new THREE.MeshStandardMaterial({
				color: color,
				roughness: 0.2,
				metalness: 0.1,
				transparent: true,
				opacity: opacity,
				flatShading: true, 
			});
			const mesh = new THREE.Mesh(geometry, material);
			
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

		const diamondGeom = new THREE.OctahedronGeometry(1, 0);
		const columnGeom = new THREE.CylinderGeometry(0.4, 0.4, 3, 8);
		const hexGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 6);
		const shardGeom = new THREE.ConeGeometry(0.6, 2.4, 5);
		const clusterGeom = new THREE.IcosahedronGeometry(1.2, 0);

		createCrystal(diamondGeom, 0x9966ff, 0.85);
		createCrystal(columnGeom, 0xffccaa, 0.75);
		createCrystal(hexGeom, 0x66ddff, 0.9);
		createCrystal(shardGeom, 0xeeffaa, 0.8);
		createCrystal(clusterGeom, 0xff8888, 0.8);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
		directionalLight.position.set(5, 10, 7.5);
		scene.add(directionalLight);

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);

		// --- RENDER LOOP ---
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			crystals.forEach(crystal => {
				// FIX: Use the 'smoothedMouse' position for all physics calculations.
				const mouse3D = new THREE.Vector3(smoothedMouse.x * (bounds.x / 2), smoothedMouse.y * (bounds.y / 2), 0);
				const distanceToMouse = crystal.mesh.position.distanceTo(mouse3D);
				
				if (distanceToMouse < 5) {
					const repulsionForce = new THREE.Vector3().subVectors(crystal.mesh.position, mouse3D).normalize();
					repulsionForce.multiplyScalar((5 - distanceToMouse) * 0.008);
					crystal.velocity.add(repulsionForce);
				}

				crystal.mesh.position.add(crystal.velocity);

				if (Math.abs(crystal.mesh.position.x) > bounds.x / 2) crystal.velocity.x *= -1;
				if (Math.abs(crystal.mesh.position.y) > bounds.y / 2) crystal.velocity.y *= -1;
				if (Math.abs(crystal.mesh.position.z) > bounds.z / 2) crystal.velocity.z *= -1;

				crystal.mesh.rotation.x += 0.001;
				crystal.mesh.rotation.y += 0.002;
			});

			renderer.render(scene, camera);
		};
		animate();
		
		// --- CLEANUP ---
		return () => {
			cancelAnimationFrame(animationFrameId);
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
