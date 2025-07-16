<script lang="ts">
    import * as THREE from 'three';
    import { gsap } from 'gsap';
    
    let canvas: HTMLCanvasElement;
    let scene: any;
    let camera: any;
    let renderer: any;
    let iris: any;
    
    // Use $state runes for reactive variables
    let mouseX = $state(0);
    let mouseY = $state(0);
    let isInitialized = $state(false);
    
    // Use $effect instead of onMount for side effects
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
        const eyeTexture = textureLoader.load('/assets/eye-texture.png', (texture) => {
            // Ensure proper texture settings
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
        });
        
        // Create a 3D sphere for the eyeball
        const eyeballGeometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Material for the 3D eyeball
        const eyeballMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mousePos: { value: new THREE.Vector2(0, 0) },
                eyeTexture: { value: eyeTexture }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    
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
                varying vec3 vWorldPosition;
                uniform float time;
                uniform vec2 mousePos;
                uniform sampler2D eyeTexture;
                
                void main() {
                    // Sample the eye texture
                    vec4 textureColor = texture2D(eyeTexture, vUv);
                    
                    // Add subtle shimmer
                    float shimmer = sin(vUv.x * 15.0 + time * 2.0) * sin(vUv.y * 15.0 - time * 1.5) * 0.02;
                    
                    // Lighting based on normal (3D lighting)
                    vec3 lightDirection = normalize(vec3(mousePos.x * 2.0, mousePos.y * 2.0, 5.0));
                    float lighting = max(dot(vNormal, lightDirection), 0.3) + 0.7;
                    
                    // Enhanced colors for 3D effect
                    vec3 finalColor = textureColor.rgb * lighting + shimmer;
                    
                    // Add specular highlights for wetness
                    float specular = pow(max(dot(vNormal, lightDirection), 0.0), 32.0) * 0.3;
                    finalColor += specular;
                    
                    gl_FragColor = vec4(finalColor, textureColor.a);
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
        
        // Key light from front
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(0, 0, 5);
        scene.add(keyLight);
        
        // Rim lights for depth
        const rimLight1 = new THREE.PointLight(0x6b46c1, 0.6, 10);
        rimLight1.position.set(3, 3, 3);
        scene.add(rimLight1);
        
        const rimLight2 = new THREE.PointLight(0xec4899, 0.6, 10);
        rimLight2.position.set(-3, -3, 3);
        scene.add(rimLight2);
        
        // Mouse movement handler - make the eye actually look at the mouse
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // Convert mouse position to 3D world coordinates
            const mousePosition = new THREE.Vector3(mouseX * 3, mouseY * 3, 2);
            
            // Make the eye look at the mouse position
            iris.lookAt(mousePosition);
            
            // Update shader uniforms for lighting effects
            eyeballMaterial.uniforms.mousePos.value.set(mouseX, mouseY);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        
        // Animation loop - NO automatic rotation, only time-based effects
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Only update time for breathing and shimmer effects
            eyeballMaterial.uniforms.time.value += 0.01;
            
            renderer.render(scene, camera);
        };
        
        animate();
        
        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', handleResize);
        
        isInitialized = true;
        
        // Cleanup function - runs when component unmounts or effect re-runs
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (renderer) {
                renderer.dispose();
            }
        };
    });
</script>

<div class="fixed inset-0 -z-10">
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
    
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-space-blue pointer-events-none"></div>
    
    <!-- Particle effect placeholder -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-star-white rounded-full animate-float opacity-60"></div>
        <div class="absolute top-3/4 right-1/3 w-1 h-1 bg-nebula-pink rounded-full animate-float opacity-40" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-1/4 left-1/2 w-3 h-3 bg-cosmic-purple rounded-full animate-float opacity-50" style="animation-delay: 4s;"></div>
    </div>
</div>