<script lang="ts">
  import './app.css';
  import Nav from './components/Nav.svelte';
  import CtaRow from './components/CtaRow.svelte';
  import Hero from './components/Hero.svelte';
  import Features from './components/Features.svelte';
  import MotdBanner from './components/MotdBanner.svelte';
  import { gsap } from 'gsap';
  
  // Track if the app has mounted for better control
  let isMounted = $state(false);
  
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

<main class="min-h-screen overflow-hidden">
  <!-- Navigation -->
  <Nav />
  
  <!-- Hero Section with 3D Iris -->
  <section class="relative min-h-screen flex flex-col justify-center items-center pt-20">
    <Hero />
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
    overflow-x: hidden;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
</style>