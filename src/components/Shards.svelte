<script lang="ts">
	import * as THREE from 'three';
	import { gsap } from 'gsap';

	let canvas: HTMLCanvasElement;

	// Reactive state for the raw mouse position
	let mousePosition = $state({ x: 0, y: 0 });

	// A plain object to hold the interpolated (smoothed) mouse position.
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

	// This effect watches for changes in the raw mouse position
	// and triggers a smooth animation on the 'smoothedMouse' object.
	$effect(() => {
		gsap.to(smoothedMouse, {
			x: mousePosition.x,
			y: mousePosition.y,
			duration: 0.5,
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
		const crystals: { mesh: any; velocity: any; stuckTime: number; lastPosition: any; respawnTimer: number }[] = [];
		const bounds = { x: 50, y: 25, z: 30 };

		const createCrystal = (geometry: any, color: any, opacity: number) => {
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
			crystals.push({ 
				mesh, 
				velocity, 
				stuckTime: 0,
				lastPosition: mesh.position.clone(),
				respawnTimer: Math.random() * 600 + 800 // Random respawn time between 800-1400 frames (13-23 seconds)
			});
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

		// Function to respawn a crystal with fade transition
		const respawnCrystal = (crystal: any, index: number) => {
			// Fade out
			gsap.to(crystal.mesh.material, {
				opacity: 0,
				duration: 1.2,
				ease: 'power2.out',
				onComplete: () => {
					// Move to new random position (not necessarily near center)
					const newX = (Math.random() - 0.5) * bounds.x * 0.8;
					const newY = (Math.random() - 0.5) * bounds.y * 0.8;
					const newZ = (Math.random() - 0.5) * bounds.z * 0.8;
					
					crystal.mesh.position.set(newX, newY, newZ);
					crystal.velocity.set(
						(Math.random() - 0.5) * 0.02,
						(Math.random() - 0.5) * 0.02,
						(Math.random() - 0.5) * 0.02
					);
					crystal.stuckTime = 0;
					crystal.lastPosition.copy(crystal.mesh.position);
					crystal.respawnTimer = Math.random() * 600 + 800;
					
					// Fade in
					gsap.to(crystal.mesh.material, {
						opacity: crystal.mesh.material.color.getHex() === 0x9966ff ? 0.85 : 
								crystal.mesh.material.color.getHex() === 0xffccaa ? 0.75 :
								crystal.mesh.material.color.getHex() === 0x66ddff ? 0.9 :
								crystal.mesh.material.color.getHex() === 0xeeffaa ? 0.8 : 0.8,
						duration: 1.2,
						ease: 'power2.out'
					});
				}
			});
		};

		// --- RENDER LOOP ---
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);

			crystals.forEach((crystal, index) => {
				// Check if crystal has moved significantly
				const distanceMoved = crystal.mesh.position.distanceTo(crystal.lastPosition);
				if (distanceMoved < 0.1) {
					crystal.stuckTime++;
				} else {
					crystal.stuckTime = 0;
				}
				crystal.lastPosition.copy(crystal.mesh.position);

				// Random movement for stuck crystals instead of center-seeking
				if (crystal.stuckTime > 120) { // 2 seconds at 60fps
					const randomForce = new THREE.Vector3(
						(Math.random() - 0.5) * 0.02,
						(Math.random() - 0.5) * 0.02,
						(Math.random() - 0.5) * 0.02
					);
					crystal.velocity.add(randomForce);
					crystal.stuckTime = 0; // Reset stuck time after applying random force
				}

				// Respawn timer
				crystal.respawnTimer--;
				if (crystal.respawnTimer <= 0) {
					respawnCrystal(crystal, index);
					return; // Skip this frame's update
				}

				const mousePos2D = new THREE.Vector2(smoothedMouse.x * (bounds.x / 2), smoothedMouse.y * (bounds.y / 2));
				const crystalPos2D = new THREE.Vector2(crystal.mesh.position.x, crystal.mesh.position.y);
				const distanceToMouse = crystalPos2D.distanceTo(mousePos2D);
				
				const evasionRadius = 7;
				if (distanceToMouse < evasionRadius) {
					const repulsionForce = new THREE.Vector3().subVectors(
						new THREE.Vector3(crystal.mesh.position.x, crystal.mesh.position.y, 0), 
						new THREE.Vector3(mousePos2D.x, mousePos2D.y, 0)
					).normalize();
					
					repulsionForce.multiplyScalar((evasionRadius - distanceToMouse) * 0.016);
					crystal.velocity.add(repulsionForce);
				}

				crystal.velocity.multiplyScalar(0.98);

				// Maximum speed limit for each shard
				const maxSpeed = 0.08;
				if (crystal.velocity.length() > maxSpeed) {
					crystal.velocity.normalize().multiplyScalar(maxSpeed);
				}

				crystal.mesh.position.add(crystal.velocity);

				// Collision detection between crystals
				const collisionRadius = 2.5;
				crystals.forEach((otherCrystal, otherIndex) => {
					if (index !== otherIndex) {
						const distance = crystal.mesh.position.distanceTo(otherCrystal.mesh.position);
						if (distance < collisionRadius) {
							// Calculate repulsion force
							const repulsionDirection = new THREE.Vector3()
								.subVectors(crystal.mesh.position, otherCrystal.mesh.position)
								.normalize();
							
							const repulsionStrength = (collisionRadius - distance) * 0.03;
							const repulsionForce = repulsionDirection.multiplyScalar(repulsionStrength);
							
							crystal.velocity.add(repulsionForce);
							otherCrystal.velocity.sub(repulsionForce);
							
							// Move crystals apart to prevent overlap
							const separationDistance = collisionRadius - distance;
							const separationVector = repulsionDirection.multiplyScalar(separationDistance * 0.5);
							crystal.mesh.position.add(separationVector);
							otherCrystal.mesh.position.sub(separationVector);
						}
					}
				});

				// Improved boundary handling with bounce and inward force
				const margin = 2; // Keep crystals away from exact boundaries
				const bounceStrength = 0.8;
				
				if (crystal.mesh.position.x > bounds.x / 2 - margin) {
					crystal.mesh.position.x = bounds.x / 2 - margin;
					crystal.velocity.x *= -bounceStrength;
					// Add inward force
					crystal.velocity.x -= 0.005;
				} else if (crystal.mesh.position.x < -bounds.x / 2 + margin) {
					crystal.mesh.position.x = -bounds.x / 2 + margin;
					crystal.velocity.x *= -bounceStrength;
					// Add inward force
					crystal.velocity.x += 0.005;
				}

				if (crystal.mesh.position.y > bounds.y / 2 - margin) {
					crystal.mesh.position.y = bounds.y / 2 - margin;
					crystal.velocity.y *= -bounceStrength;
					// Add inward force
					crystal.velocity.y -= 0.005;
				} else if (crystal.mesh.position.y < -bounds.y / 2 + margin) {
					crystal.mesh.position.y = -bounds.y / 2 + margin;
					crystal.velocity.y *= -bounceStrength;
					// Add inward force
					crystal.velocity.y += 0.005;
				}

				if (crystal.mesh.position.z > bounds.z / 2 - margin) {
					crystal.mesh.position.z = bounds.z / 2 - margin;
					crystal.velocity.z *= -bounceStrength;
					// Add inward force
					crystal.velocity.z -= 0.005;
				} else if (crystal.mesh.position.z < -bounds.z / 2 + margin) {
					crystal.mesh.position.z = -bounds.z / 2 + margin;
					crystal.velocity.z *= -bounceStrength;
					// Add inward force
					crystal.velocity.z += 0.005;
				}

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
				(c.mesh.material as any).dispose();
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
