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
        
        // Iris geometry (hemisphere) - increased size for better visibility
        const geometry = new THREE.SphereGeometry(3, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
        
        // Shader material for the iris with texture
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mousePos: { value: new THREE.Vector2(0, 0) },
                eyeTexture: { value: eyeTexture },
                opacity: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                
                void main() {
                    vUv = uv;
                    vNormal = normal;
                    vPosition = position;
                    
                    vec3 pos = position;
                    // Subtle breathing animation
                    float breathe = sin(time * 1.5) * 0.02;
                    pos += normal * breathe;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float time;
                uniform vec2 mousePos;
                uniform sampler2D eyeTexture;
                uniform float opacity;
                
                void main() {
                    // Sample the eye texture
                    vec4 textureColor = texture2D(eyeTexture, vUv);
                    
                    // Add subtle shimmer effect
                    float shimmer = sin(vUv.x * 30.0 + time * 2.0) * sin(vUv.y * 30.0 - time * 1.5) * 0.05;
                    
                    // Dynamic lighting based on mouse position
                    vec3 lightDir = normalize(vec3(mousePos.x, mousePos.y, 1.0));
                    float lighting = dot(vNormal, lightDir) * 0.3 + 0.7;
                    
                    // Enhance the texture with lighting and shimmer
                    vec3 finalColor = textureColor.rgb * lighting + shimmer;
                    
                    // Add subtle glow to edges
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    float edgeGlow = 1.0 - smoothstep(0.4, 0.5, dist);
                    finalColor += edgeGlow * 0.1 * vec3(0.6, 0.8, 1.0);
                    
                    gl_FragColor = vec4(finalColor, textureColor.a * opacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        iris = new THREE.Mesh(geometry, material);
        // Position the iris so it's properly centered and visible
        iris.position.set(0, 0, 0);
        iris.rotation.x = -Math.PI * 0.1; // Slight tilt to make it look more natural
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
        
        // Mouse movement handler with enhanced iris tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // Smooth iris rotation to follow mouse (like a real eye)
            gsap.to(iris.rotation, {
                x: mouseY * 0.15 - Math.PI * 0.1, // Keep the slight downward tilt
                y: mouseX * 0.15,
                duration: 0.6,
                ease: "power2.out"
            });
            
            // Update shader uniforms
            material.uniforms.mousePos.value.set(mouseX, mouseY);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            material.uniforms.time.value += 0.01;
            iris.rotation.z += 0.001;
            
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