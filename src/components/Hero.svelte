<script lang="ts">
	import * as THREE from 'three';
	
	let canvas: HTMLCanvasElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let iris: THREE.Mesh;
    let eyeballMaterial: THREE.ShaderMaterial;

	// State variables for the debug sliders
	let rotationX = $state(0);
	let rotationY = $state(0);
	let rotationZ = $state(0);
	let textureZoom = $state(1);
	let aspectRatio = $state(1);
	
	let isInitialized = $state(false);
	
	$effect(() => {
		if (!canvas || isInitialized) return;
		
		// Scene setup
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x0a0e27, 1, 15);
		
		// Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		
		// Renderer
		renderer = new THREE.WebGLRenderer({ 
			canvas, 
			antialias: true, 
			alpha: true 
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		
		// Load eye texture
		const textureLoader = new THREE.TextureLoader();
		const eyeTexture = textureLoader.load('/assets/iris_floating.png', (texture) => {
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
		}, undefined, () => {
            console.error('Failed to load eye texture.');
        });
		
		// Create a 3D sphere for the eyeball
		const eyeballGeometry = new THREE.SphereGeometry(2, 64, 64);
		
		// Material for the 3D eyeball
		eyeballMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				eyeTexture: { value: eyeTexture },
				// Uniform for controlling texture scale from the slider
				textureZoom: { value: 1.0 },
				// NEW: Uniform for controlling aspect ratio correction
				aspectRatio: { value: 1.0 }
			},
			vertexShader: `
				varying vec2 vUv;
				varying vec3 vNormal;
				uniform float time;
				
				void main() {
					vUv = uv;
					vNormal = normalize(normalMatrix * normal);
					
					// Subtle breathing animation
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
					// Center UVs and apply aspect ratio correction first
					vec2 correctedUv = vUv;
					correctedUv.x = (correctedUv.x - 0.5) * aspectRatio + 0.5;
					
					// Then apply zoom from the corrected coordinates
					vec2 zoomedUv = (correctedUv - 0.5) * textureZoom + 0.5;
					
					vec3 finalColor;
					float finalAlpha = 1.0;
					
					// Define sclera (white part of eye) color
					vec3 scleraColor = vec3(0.9, 0.9, 0.95);

					// Check if the zoomed UV is within the texture's 0-1 range
					if (zoomedUv.x > 1.0 || zoomedUv.x < 0.0 || zoomedUv.y > 1.0 || zoomedUv.y < 0.0) {
						// Outside texture bounds - render sclera
						finalColor = scleraColor;
					} else {
						// Inside bounds - sample texture and blend with sclera based on alpha
						vec4 textureColor = texture2D(eyeTexture, zoomedUv);
						
						// OPTION 2: Proper alpha blending with sclera
						// This respects PNG transparency and creates smooth transitions
						finalColor = mix(scleraColor, textureColor.rgb, textureColor.a);
					}
					
					// Add subtle shimmer over the whole eye surface
					float shimmer = sin(vUv.x * 15.0 + time * 2.0) * sin(vUv.y * 15.0 - time * 1.5) * 0.02;
					
					// Lighting with a fixed direction
					vec3 lightDirection = normalize(vec3(0.5, 0.5, 1.0));
					float lighting = max(dot(vNormal, lightDirection), 0.3) + 0.7;
					
					// Apply lighting and shimmer
					finalColor = finalColor * lighting + shimmer;
					
					// Add specular highlights for wetness
					float specular = pow(max(dot(vNormal, lightDirection), 0.0), 32.0) * 0.3;
					finalColor += specular;
					
					gl_FragColor = vec4(finalColor, finalAlpha);
				}
			`,
			side: THREE.FrontSide
		});
		
		iris = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
		iris.position.set(0, 0, 0);
		scene.add(iris);
		
		// Enhanced lighting for better eye visibility
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		scene.add(ambientLight);
		
		const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
		keyLight.position.set(0, 0, 5);
		scene.add(keyLight);
		
		const rimLight1 = new THREE.PointLight(0x6b46c1, 0.6, 10);
		rimLight1.position.set(3, 3, 3);
		scene.add(rimLight1);
		
		const rimLight2 = new THREE.PointLight(0xec4899, 0.6, 10);
		rimLight2.position.set(-3, -3, 3);
		scene.add(rimLight2);
		
		const animate = () => {
			requestAnimationFrame(animate);
			
			eyeballMaterial.uniforms.time.value += 0.01;

            if (iris) {
                // Apply rotation and zoom from sliders in every frame
                iris.rotation.x = Number(rotationX);
                iris.rotation.y = Number(rotationY);
                iris.rotation.z = Number(rotationZ);
				eyeballMaterial.uniforms.textureZoom.value = Number(textureZoom);
				eyeballMaterial.uniforms.aspectRatio.value = Number(aspectRatio);
            }
			
			renderer.render(scene, camera);
		};
		
		animate();
		
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		
		window.addEventListener('resize', handleResize);
		
		isInitialized = true;
		
		// Cleanup function
		return () => {
			window.removeEventListener('resize', handleResize);
			if (renderer) {
				renderer.dispose();
                eyeballGeometry.dispose();
                eyeballMaterial.dispose();
                if(eyeTexture) eyeTexture.dispose();
			}
		};
	});
</script>

<div class="fixed inset-0 -z-10 bg-[#0a0e27]">
	<canvas bind:this={canvas} class="w-full h-full"></canvas>
	
	<!-- Gradient overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e27] pointer-events-none"></div>
	
	<!-- Particle effect placeholder with standard tailwind animations -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
		<div class="absolute top-3/4 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-40" style="animation-delay: 2s;"></div>
		<div class="absolute bottom-1/4 left-1/2 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-50" style="animation-delay: 4s;"></div>
	</div>
</div>

<!-- Debug Controls -->
<div class="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg p-4 bg-black/50 rounded-lg backdrop-blur-sm text-white font-mono text-xs z-10 space-y-3">
	<!-- Rotation X Slider -->
	<div>
		<div class="flex justify-between">
			<label for="rotX">Rotation X</label>
			<span>{Number(rotationX).toFixed(2)}</span>
		</div>
		<input type="range" id="rotX" bind:value={rotationX} min={-Math.PI} max={Math.PI} step="0.01" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500">
	</div>
	<!-- Rotation Y Slider -->
	<div>
		<div class="flex justify-between">
			<label for="rotY">Rotation Y</label>
			<span>{Number(rotationY).toFixed(2)}</span>
		</div>
		<input type="range" id="rotY" bind:value={rotationY} min={-Math.PI} max={Math.PI} step="0.01" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500">
	</div>
	<!-- Rotation Z Slider -->
	<div>
		<div class="flex justify-between">
			<label for="rotZ">Rotation Z</label>
			<span>{Number(rotationZ).toFixed(2)}</span>
		</div>
		<input type="range" id="rotZ" bind:value={rotationZ} min={-Math.PI} max={Math.PI} step="0.01" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500">
	</div>
	<!-- Texture Zoom Slider -->
	<div>
		<div class="flex justify-between">
			<label for="zoom">Texture Zoom</label>
			<span>{Number(textureZoom).toFixed(2)}</span>
		</div>
		<input type="range" id="zoom" bind:value={textureZoom} min="0.1" max="5" step="0.01" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500">
	</div>
	<!-- NEW: Aspect Ratio Slider -->
	<div>
		<div class="flex justify-between">
			<label for="aspect">Aspect Ratio</label>
			<span>{Number(aspectRatio).toFixed(2)}</span>
		</div>
		<input type="range" id="aspect" bind:value={aspectRatio} min="0.1" max="2.0" step="0.01" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500">
	</div>
</div>