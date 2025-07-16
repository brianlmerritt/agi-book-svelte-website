<script lang="ts">
	import * as THREE from 'three';
	import { gsap } from 'gsap';
	
	// Props from parent component
	let { controlMode = 'mouse' }: { controlMode?: 'mouse' | 'manual' } = $props();
	
	let canvas: HTMLCanvasElement;

	// State variables for manual control
	let rotationX = $state(0);
	let rotationY = $state(-1.57);
	let rotationZ = $state(0);
	let textureZoom = $state(0.99);
	let aspectRatio = $state(2.30);
	
	// Reactive state for mouse position (-1 to +1)
	let mouseX = $state(0);
	let mouseY = $state(0);

	// A plain object to hold the smoothly animated rotation values.
	const smoothedRotation = {
		x: 0,
		y: -1.57 // Start at the calibrated center
	};
	
	// This effect handles adding/removing the mouse listener based on the control mode.
	$effect(() => {
		if (controlMode === 'mouse') {
			const handleMouseMove = (e: MouseEvent) => {
				mouseX = (e.clientX / window.innerWidth) * 2 - 1;
				mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
			};
			window.addEventListener('mousemove', handleMouseMove);
			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
			};
		}
	});

	// This effect reacts to mouse changes and triggers the smooth animation.
	$effect(() => {
		// The 'canvas' dependency ensures this only runs after the canvas element exists.
		if (!canvas || controlMode !== 'mouse') return;

		// FIX: Invert the Y-axis mouse input for X-rotation
		const targetX = -mouseY * 0.2; // Reverses the up/down movement
		const targetY = -1.57 + (mouseX * 0.2);

		// Use GSAP to smoothly animate towards the target
		gsap.to(smoothedRotation, {
			x: targetX,
			y: targetY,
			duration: 1.0,
			ease: 'power2.out'
		});
	});

	// This effect handles the entire Three.js lifecycle.
	$effect(() => {
		if (!canvas) return;

		let animationFrameId: number;

		// --- SCENE SETUP ---
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x0a0e27, 1, 15);
		
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		
		const renderer = new THREE.WebGLRenderer({ 
			canvas, 
			antialias: true, 
			alpha: true 
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		
		const textureLoader = new THREE.TextureLoader();
		const eyeTexture = textureLoader.load('/assets/eye-texture2.png', (texture: any) => {
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
		});
		
		const eyeballGeometry = new THREE.SphereGeometry(2, 64, 64);
		
		const eyeballMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				eyeTexture: { value: eyeTexture },
				textureZoom: { value: 0.99 },
				aspectRatio: { value: 2.30 }
			},
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vNormal;
				uniform float time;
				
				void main() {
					vUv = uv;
					vNormal = normalize(normalMatrix * normal);
					vec3 pos = position;
					float breathe = sin(time * 1.2) * 0.01;
					pos += normal * breathe;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
				}
			`,
			fragmentShader: `
				varying vec2 vUv;
				varying vec3 vNormal;
				uniform float time;
				uniform sampler2D eyeTexture;
				uniform float textureZoom;
				uniform float aspectRatio;
				
				void main() {
					vec2 correctedUv = vUv;
					correctedUv.x = (correctedUv.x - 0.5) * aspectRatio + 0.5;
					vec2 zoomedUv = (correctedUv - 0.5) * textureZoom + 0.5;
					vec2 clampedUv = clamp(zoomedUv, 0.0, 1.0);
					vec4 textureColor = texture2D(eyeTexture, clampedUv);
					vec3 finalColor = textureColor.rgb;
					vec2 center = vec2(0.5, 0.5);
					float distFromCenter = distance(correctedUv, center);
					float fadeOut = 1.0 - smoothstep(0.3, 0.8, distFromCenter);
					finalColor = mix(finalColor * 0.7, finalColor, fadeOut);
					float shimmer = sin(vUv.x * 15.0 + time * 2.0) * sin(vUv.y * 15.0 - time * 1.5) * 0.02;
					vec3 lightDirection = normalize(vec3(0.5, 0.5, 1.0));
					float lighting = max(dot(vNormal, lightDirection), 0.3) + 0.7;
					finalColor = finalColor * lighting + shimmer;
					float specular = pow(max(dot(vNormal, lightDirection), 0.0), 32.0) * 0.3;
					finalColor += specular;
					gl_FragColor = vec4(finalColor, 1.0);
				}
			`,
			side: THREE.FrontSide
		});
		
		const iris = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
		scene.add(iris);
		
		// --- LIGHTING ---
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		scene.add(ambientLight);
		const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
		keyLight.position.set(0, 0, 5);
		scene.add(keyLight);
		
		// --- EVENT LISTENERS ---
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);

		// --- RENDER LOOP ---
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);
			eyeballMaterial.uniforms.time.value += 0.01;

			if (controlMode === 'mouse') {
				iris.rotation.x = smoothedRotation.x;
				iris.rotation.y = smoothedRotation.y;
				iris.rotation.z = 0;
				eyeballMaterial.uniforms.textureZoom.value = 0.99;
				eyeballMaterial.uniforms.aspectRatio.value = 2.30;
			} else {
				iris.rotation.x = Number(rotationX);
				iris.rotation.y = Number(rotationY);
				iris.rotation.z = Number(rotationZ);
				eyeballMaterial.uniforms.textureZoom.value = Number(textureZoom);
				eyeballMaterial.uniforms.aspectRatio.value = Number(aspectRatio);
			}
			renderer.render(scene, camera);
		};
		animate();
		
		// --- CLEANUP ---
		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener('resize', handleResize);
			
			scene.remove(iris);
			eyeballGeometry.dispose();
			eyeballMaterial.dispose();
			eyeTexture.dispose();
			renderer.dispose();
		};
	});
</script>

<div class="fixed inset-0 -z-10">
	<canvas bind:this={canvas} class="w-full h-full"></canvas>
	
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e27] pointer-events-none"></div>
	
	<!-- Particle effect placeholder -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
		<div class="absolute top-3/4 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-40" style="animation-delay: 2s;"></div>
		<div class="absolute bottom-1/4 left-1/2 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-50" style="animation-delay: 4s;"></div>
	</div>
</div>

<!-- Debug Controls - Only show when in manual mode -->
{#if controlMode === 'manual'}
<div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg p-4 bg-black/50 rounded-lg backdrop-blur-sm text-white font-mono text-xs z-10 space-y-3">
	<!-- Rotation Sliders -->
	<div>
		<label>Rotation X: {Number(rotationX).toFixed(2)}</label>
		<input type="range" bind:value={rotationX} min={-Math.PI} max={Math.PI} step="0.01">
	</div>
	<div>
		<label>Rotation Y: {Number(rotationY).toFixed(2)}</label>
		<input type="range" bind:value={rotationY} min={-Math.PI} max={Math.PI} step="0.01">
	</div>
	<div>
		<label>Rotation Z: {Number(rotationZ).toFixed(2)}</label>
		<input type="range" bind:value={rotationZ} min={-Math.PI} max={Math.PI} step="0.01">
	</div>
	<!-- Texture Sliders -->
	<div>
		<label>Texture Zoom: {Number(textureZoom).toFixed(2)}</label>
		<input type="range" bind:value={textureZoom} min="0.1" max="5" step="0.01">
	</div>
	<div>
		<label>Aspect Ratio: {Number(aspectRatio).toFixed(2)}</label>
		<input type="range" bind:value={aspectRatio} min="0.1" max="3.0" step="0.01">
	</div>
</div>
{/if}
