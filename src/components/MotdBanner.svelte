<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from 'gsap';
  import messages from '../data/messages.json';
  
  interface Message {
    text: string;
    img: string;
  }
  
  // Use $state() rune for reactive state
  let currentIndex = $state(0);
  let bannerRef = $state<HTMLDivElement>();
  let interval: number;
  let isPaused = $state(false);
  
  const hasMultipleMessages = messages.length > 1;
  
  // Auto-rotate messages
  onMount(() => {
    if (hasMultipleMessages) {
      interval = setInterval(() => {
        if (!isPaused) {
          currentIndex = (currentIndex + 1) % messages.length;
        }
      }, 8000);
    }
    return () => clearInterval(interval);
  });
  
  // Wiggle animation for single message
  onMount(() => {
    if (!hasMultipleMessages && bannerRef) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = bannerRef.getBoundingClientRect();
        const distance = Math.abs(e.clientY - (rect.top + rect.height / 2));
        if (distance < 100) {
          gsap.to(bannerRef, {
            x: Math.sin(Date.now() * 0.002) * 5,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  });
  
  // Use $effect instead of $: for reactive effects
  $effect(() => {
    if (bannerRef) {
      gsap.from(bannerRef, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out"
      });
    }
  });
</script>

<div 
  bind:this={bannerRef}
  class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-cosmic-purple/90 to-nebula-pink/90 backdrop-blur-md border-t border-star-white/20"
  onmouseenter={() => isPaused = true}
  onmouseleave={() => isPaused = false}
>
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-center space-x-6">
      {#if messages[currentIndex].img}
        <img 
          src={messages[currentIndex].img} 
          alt="Message illustration"
          class="w-12 h-12 rounded-full object-cover ring-2 ring-star-white/50"
        />
      {/if}
      
      <p class="text-lg font-space font-semibold text-star-white text-center">
        {messages[currentIndex].text}
      </p>
      
      {#if hasMultipleMessages}
        <div class="flex space-x-2">
          {#each messages as _, index}
            <button
              onclick={() => currentIndex = index}
              class="w-2 h-2 rounded-full transition-all duration-300 {currentIndex === index ? 'bg-star-white w-8' : 'bg-star-white/30'}"
              aria-label="Go to message {index + 1}"
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Animated border -->
  <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-star-white to-transparent animate-pulse"></div>
</div>

<style>
  @keyframes slide-gradient {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>