<script lang="ts">
	import './app.css';
	import Nav from './components/Nav.svelte';
	import CtaRow from './components/CtaRow.svelte';
	import Hero from './components/Hero.svelte';
	import Features from './components/Features.svelte';
	import MotdBanner from './components/MotdBanner.svelte';
	import { gsap } from 'gsap';
	
	// Import the new Starfield component
	import Starfield from './components/Starfield.svelte';

	// Track if the app has mounted for better control
	let isMounted = $state(false);
	
	// Control mode for the Hero component - change this to switch modes
	let eyeControlMode: 'mouse' | 'manual' = 'mouse'; // Change to 'manual' for debugging
	
	// Use $effect instead of onMount for side effects
	$effect(() => {
		if (!isMounted) { // Only run once
			// Initial page animation
			gsap.from('body', {
				opacity: 0,
				duration: 1,
				ease: "power2.inOut"
			});
			
			isMounted = true;
		}
	});
</script>

<!-- The main container now has a transparent background -->
<main class="min-h-screen overflow-hidden bg-transparent">
	<!-- The Starfield component renders the background -->
	<Starfield />

	<!-- Navigation -->
	<Nav />
	
	<!-- Hero Section with 3D Iris -->
	<section class="relative min-h-screen flex flex-col justify-center items-center pt-20">
		<Hero controlMode={eyeControlMode} />
		<CtaRow />
	</section>
	
	<!-- Features Section -->
	<Features />
	
	<!-- Message of the Day Banner -->
	<MotdBanner />
	
	<!-- Spacer for fixed banner -->
	<div class="h-20"></div>
</main>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	
	:global(body) {
		/* Set the base background color here, which will be visible behind the canvas */
		background-color: #0a0e27;
		overflow-x: hidden;
	}
	
	:global(*) {
		box-sizing: border-box;
	}

	/* Make sections transparent so the starfield can be seen */
	:global(section) {
		background-color: transparent !important;
	}
</style>
