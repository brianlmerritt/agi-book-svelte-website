<script lang="ts">
	import * as THREE from 'three';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	// Reactive state for mouse position, normalized from -1 to 1
	let mouseX = 0;
	let mouseY = 0;

	onMount(() => {
		console.log('Starfield component mounting...');
		if (!canvas) {
			console.log('Canvas not found');
			return;
		}
		console.log('Canvas found, setting up Three.js scene...');

		let animationFrameId: number;

		// --- SCENE SETUP ---
		const scene = new THREE.Scene();
		
		const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.z = 1; // Position the camera slightly in front of the origin
		
		const renderer = new THREE.WebGLRenderer({ 
			canvas,
			antialias: true,
			alpha: true // Ensure the canvas background is transparent
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// --- STAR GENERATION ---
		const starVertices = [];
		for (let i = 0; i < 15000; i++) { // Increased star count
			const x = (Math.random() - 0.5) * 2000;
			const y = (Math.random() - 0.5) * 2000;
			const z = (Math.random() - 0.5) * 2000;
			starVertices.push(x, y, z);
		}

		const starGeometry = new THREE.BufferGeometry();
		starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

		const starMaterial = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 1.2, // Slightly larger stars
			transparent: true,
			blending: THREE.AdditiveBlending,
			sizeAttenuation: true
		});

		const stars = new THREE.Points(starGeometry, starMaterial);
		scene.add(stars);

		// --- EVENT LISTENERS ---
		const handleMouseMove = (event: MouseEvent) => {
			// Normalize mouse coordinates to -1 to 1 range
			mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener('mousemove', handleMouseMove);

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);

		// --- RENDER LOOP ---
		const clock = new THREE.Clock();
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);
			const elapsedTime = clock.getElapsedTime();

			// More pronounced parallax effect
			stars.rotation.y = mouseX * 0.5;
			stars.rotation.x = mouseY * 0.3;
			
			// Add subtle rotation over time
			stars.rotation.y += elapsedTime * 0.05;

			renderer.render(scene, camera);
		};
		animate();
		
		// --- CLEANUP ---
		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('resize', handleResize);
			
			// Dispose of Three.js objects to prevent memory leaks
			starGeometry.dispose();
			starMaterial.dispose();
			scene.remove(stars);
			renderer.dispose();
		};
	});
</script>

<!-- The canvas is styled to be a fixed background element -->
<canvas 
	bind:this={canvas} 
	class="fixed top-0 left-0 w-full h-full -z-30 pointer-events-none"
	style="background-color: rgba(255, 0, 0, 0.1);"
></canvas>
