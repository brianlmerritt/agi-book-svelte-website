<script lang="ts">
	import './app.css';
	import Nav from './components/Nav.svelte';
	import CtaRow from './components/CtaRow.svelte';
	import Hero from './components/Hero.svelte';
	import Features from './components/Features.svelte';
	import MotdBanner from './components/MotdBanner.svelte';
	import { gsap } from 'gsap';
	
	// Import the background and foreground components
	import Starfield from './components/Starfield.svelte';
	import Shards from './components/Shards.svelte';

	// Track if the app has mounted for better control
	let isMounted = $state(false);
	
	// Control mode for the Hero component
	let eyeControlMode: 'mouse' | 'manual' = 'mouse';
	
	$effect(() => {
		if (!isMounted) { // Only run once
			gsap.from('body', {
				opacity: 0,
				duration: 1,
				ease: "power2.inOut"
			});
			isMounted = true;
		}
	});
</script>

<main class="min-h-screen overflow-hidden bg-transparent">
	<!-- The Starfield component renders the deep background -->
	<Starfield />
	
	<!-- The Shards component renders in front of the page content -->
	<Shards />

	<!-- Navigation -->
	<Nav />
	
	<!-- Hero Section with 3D Iris -->
	<section class="relative min-h-screen flex flex-col justify-center items-center pt-20">
		<Hero controlMode={eyeControlMode} />
		<!--<CtaRow />-->
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
		background-color: #0a0e27;
		overflow-x: hidden;
	}
	
	:global(*) {
		box-sizing: border-box;
	}

	:global(section) {
		background-color: transparent !important;
	}
</style>
