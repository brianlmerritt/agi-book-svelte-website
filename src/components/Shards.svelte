<script lang="ts">
    import * as THREE from 'three';
    import { gsap } from 'gsap';
    import { onMount } from 'svelte';
    import { gameStore } from '../stores/gameStore'; // Corrected import path

    let canvas: HTMLCanvasElement;
    let scoreValue: number;

    // Subscribe to the score value from the store and log changes
    gameStore.subscribe(store => {
        scoreValue = store.score;
        console.log('Current score:', scoreValue);
    });

    // Reactive state for the raw mouse position
    let mousePosition = { x: 0, y: 0 };

    // A plain object to hold the interpolated (smoothed) mouse position.
    const smoothedMouse = { x: 0, y: 0 };

    // This effect manages the mousemove event listener.
    onMount(() => {
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
    $: {
        gsap.to(smoothedMouse, {
            x: mousePosition.x,
            y: mousePosition.y,
            duration: 0.5,
            ease: 'power2.out',
        });
    }

    // This effect handles the entire Three.js lifecycle.
    onMount(() => {
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

        // --- GAME ELEMENTS ---
        const raycaster = new THREE.Raycaster();
        const centerZoneRadius = 5; // World-space radius of the invisible central scoring circle

        // --- CRYSTAL SHARD GENERATION ---
        const crystals: { mesh: THREE.Mesh; velocity: THREE.Vector3; stuckTime: number; lastPosition: THREE.Vector3; respawnTimer: number; isTransitioning: boolean; wasInCenter: boolean; }[] = [];
        const bounds = { x: 50, y: 25, z: 30 };

        const createCrystal = (geometry: THREE.BufferGeometry, color: number, opacity: number) => {
            const material = new THREE.MeshPhysicalMaterial({
                color: color,
                roughness: 0.05,
                metalness: 0.0,
                transparent: true,
                opacity: opacity,
                flatShading: true,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                ior: 1.5,
                transmission: 0.3,
                thickness: 0.5,
                envMapIntensity: 1.2,
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
                respawnTimer: Math.random() * 600 + 800,
                isTransitioning: false,
                wasInCenter: mesh.position.length() < centerZoneRadius // Check initial position
            });
        };

        const diamondGeom = new THREE.OctahedronGeometry(1, 0);
        const columnGeom = new THREE.CylinderGeometry(0.4, 0.4, 3, 8);
        const hexGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 6);
        const shardGeom = new THREE.ConeGeometry(0.6, 2.4, 5);
        const clusterGeom = new THREE.IcosahedronGeometry(1.2, 0);

        createCrystal(diamondGeom, 0x00ffff, 0.9);
        createCrystal(columnGeom, 0xff69b4, 0.85);
        createCrystal(hexGeom, 0x00ff00, 0.9);
        createCrystal(shardGeom, 0xffd700, 0.9);
        createCrystal(clusterGeom, 0xff1493, 0.85);

        // --- LIGHTING ---
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        const pointLight1 = new THREE.PointLight(0x00ffff, 0.8, 50);
        pointLight1.position.set(10, 5, 10);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0xff69b4, 0.8, 50);
        pointLight2.position.set(-10, -5, -10);
        scene.add(pointLight2);
        const pointLight3 = new THREE.PointLight(0x00ff00, 0.6, 40);
        pointLight3.position.set(0, 15, 0);
        scene.add(pointLight3);

        // --- EVENT LISTENERS ---
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const handleClick = (event: MouseEvent) => {
            // Use the raw, not smoothed, mouse position for immediate click feedback
            const clickMouse = new THREE.Vector2();
            clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(clickMouse, camera);
            const intersects = raycaster.intersectObjects(crystals.map(c => c.mesh));

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object as THREE.Mesh;
                const distanceToCenter = clickedObject.position.length();

                if (distanceToCenter < centerZoneRadius) {
                    // Clicked on a shard inside the central circle
                    gameStore.addScore(20);
                } else {
                    // Clicked on a shard outside the central circle
                    gameStore.addScore(1);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('click', handleClick);

        // --- RESPAWN LOGIC ---
        const respawnCrystal = (crystal: any) => {
            crystal.isTransitioning = true;
            gsap.to(crystal.mesh.material, {
                opacity: 0,
                duration: 1.2,
                ease: 'power2.out',
                onComplete: () => {
                    const newX = (Math.random() - 0.5) * bounds.x * 0.8;
                    const newY = (Math.random() - 0.5) * bounds.y * 0.8;
                    const newZ = (Math.random() - 0.5) * bounds.z * 0.8;
                    
                    crystal.mesh.position.set(newX, newY, newZ);
                    crystal.velocity.set((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
                    crystal.stuckTime = 0;
                    crystal.lastPosition.copy(crystal.mesh.position);
                    crystal.respawnTimer = Math.random() * 600 + 800;
                    crystal.wasInCenter = crystal.mesh.position.length() < centerZoneRadius;
                    
                    gsap.to(crystal.mesh.material, {
                        opacity: crystal.mesh.material.color.getHex() === 0x00ffff ? 0.9 : 
                                 crystal.mesh.material.color.getHex() === 0xff69b4 ? 0.85 :
                                 crystal.mesh.material.color.getHex() === 0x00ff00 ? 0.9 :
                                 crystal.mesh.material.color.getHex() === 0xffd700 ? 0.9 : 0.85,
                        duration: 1.2,
                        ease: 'power2.out',
                        onComplete: () => {
                            crystal.isTransitioning = false;
                        }
                    });
                }
            });
        };

        // --- RENDER LOOP ---
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            crystals.forEach((crystal) => {
                if (crystal.isTransitioning) {
                    crystal.mesh.rotation.x += 0.003;
                    crystal.mesh.rotation.y += 0.004;
                    crystal.mesh.rotation.z += 0.002;
                    return;
                }

                // --- SCORING LOGIC FOR NUDGING ---
                const isNowInCenter = crystal.mesh.position.length() < centerZoneRadius;
                if (isNowInCenter && !crystal.wasInCenter) {
                    // Crystal was just nudged into the center
                    gameStore.addScore(5);
                }
                crystal.wasInCenter = isNowInCenter;


                // --- PHYSICS AND MOVEMENT ---
                const distanceMoved = crystal.mesh.position.distanceTo(crystal.lastPosition);
                if (distanceMoved < 0.1) crystal.stuckTime++;
                else crystal.stuckTime = 0;
                crystal.lastPosition.copy(crystal.mesh.position);

                if (crystal.stuckTime > 120) {
                    const randomForce = new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
                    crystal.velocity.add(randomForce);
                    crystal.stuckTime = 0;
                }

                crystal.respawnTimer--;
                if (crystal.respawnTimer <= 0) {
                    respawnCrystal(crystal);
                    return;
                }

                const mousePos3D = new THREE.Vector3(smoothedMouse.x * (bounds.x / 2), smoothedMouse.y * (bounds.y / 2), 0);
                const distanceToMouse = crystal.mesh.position.distanceTo(mousePos3D);
                
                const evasionRadius = 7;
                if (distanceToMouse < evasionRadius) {
                    const repulsionForce = new THREE.Vector3().subVectors(crystal.mesh.position, mousePos3D).normalize();
                    repulsionForce.multiplyScalar((evasionRadius - distanceToMouse) * 0.016);
                    
                    // Prevent mouse from pushing crystals along the Z axis
                    repulsionForce.z = 0;

                    crystal.velocity.add(repulsionForce);
                }

                crystal.velocity.multiplyScalar(0.98);

                const maxSpeed = 0.08;
                if (crystal.velocity.length() > maxSpeed) {
                    crystal.velocity.normalize().multiplyScalar(maxSpeed);
                }

                crystal.mesh.position.add(crystal.velocity);

                // Collision between crystals
                const collisionRadius = 2.5;
                crystals.forEach((otherCrystal) => {
                    if (crystal !== otherCrystal && !otherCrystal.isTransitioning) {
                        const distance = crystal.mesh.position.distanceTo(otherCrystal.mesh.position);
                        if (distance < collisionRadius) {
                            const repulsionDirection = new THREE.Vector3().subVectors(crystal.mesh.position, otherCrystal.mesh.position).normalize();
                            const repulsionStrength = (collisionRadius - distance) * 0.03;
                            const repulsionForce = repulsionDirection.clone().multiplyScalar(repulsionStrength);
                            crystal.velocity.add(repulsionForce);
                            otherCrystal.velocity.sub(repulsionForce);
                            
                            const separationDistance = collisionRadius - distance;
                            const separationVector = repulsionDirection.clone().multiplyScalar(separationDistance * 0.5);
                            crystal.mesh.position.add(separationVector);
                            otherCrystal.mesh.position.sub(separationVector);
                        }
                    }
                });

                // Boundary handling
                const margin = 2;
                const bounceStrength = 0.8;
                
                if (crystal.mesh.position.x > bounds.x / 2 - margin) {
                    crystal.mesh.position.x = bounds.x / 2 - margin;
                    crystal.velocity.x *= -bounceStrength;
                    crystal.velocity.x -= 0.005;
                } else if (crystal.mesh.position.x < -bounds.x / 2 + margin) {
                    crystal.mesh.position.x = -bounds.x / 2 + margin;
                    crystal.velocity.x *= -bounceStrength;
                    crystal.velocity.x += 0.005;
                }

                if (crystal.mesh.position.y > bounds.y / 2 - margin) {
                    crystal.mesh.position.y = bounds.y / 2 - margin;
                    crystal.velocity.y *= -bounceStrength;
                    crystal.velocity.y -= 0.005;
                } else if (crystal.mesh.position.y < -bounds.y / 2 + margin) {
                    crystal.mesh.position.y = -bounds.y / 2 + margin;
                    crystal.velocity.y *= -bounceStrength;
                    crystal.velocity.y += 0.005;
                }

                if (crystal.mesh.position.z > bounds.z / 2 - margin) {
                    crystal.mesh.position.z = bounds.z / 2 - margin;
                    crystal.velocity.z *= -bounceStrength;
                    crystal.velocity.z -= 0.005;
                } else if (crystal.mesh.position.z < -bounds.z / 2 + margin) {
                    crystal.mesh.position.z = -bounds.z / 2 + margin;
                    crystal.velocity.z *= -bounceStrength;
                    crystal.velocity.z += 0.005;
                }

                crystal.mesh.rotation.x += 0.003;
                crystal.mesh.rotation.y += 0.004;
                crystal.mesh.rotation.z += 0.002;
            });

            renderer.render(scene, camera);
        };
        animate();
        
        // --- CLEANUP ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleClick);
            
            crystals.forEach(c => {
                scene.remove(c.mesh);
                c.mesh.geometry.dispose();
                (c.mesh.material as THREE.Material).dispose();
            });
            renderer.dispose();
        };
    });
</script>

<div class="fixed top-5 left-5 z-20 text-white text-2xl font-bold bg-black bg-opacity-50 p-3 rounded-lg">
    Score: {scoreValue}
</div>

<button 
    on:click={() => gameStore.resetScore()}
    class="fixed bottom-5 right-5 z-20 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-cyan-600 transition-colors"
>
    Reset Score
</button>

<!-- The canvas is styled to be a fixed element on top of other content -->
<canvas 
    bind:this={canvas} 
    class="fixed top-0 left-0 w-full h-full z-10"
></canvas>
