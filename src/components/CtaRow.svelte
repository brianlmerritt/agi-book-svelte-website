<script lang="ts">
    import { gsap } from 'gsap';
    import { onMount } from 'svelte';
    
    let ctaRef: HTMLDivElement;
    
    onMount(() => {
      gsap.from(ctaRef.children, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.5
      });
    });
  </script>
  
  <div bind:this={ctaRef} class="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center py-8 px-4">
    <button class="btn-glow px-8 py-4 rounded-full font-space font-bold text-lg relative group">
      <span class="relative z-10">Read Free Online</span>
      <div class="absolute inset-0 rounded-full bg-gradient-to-r from-cosmic-purple to-nebula-pink opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
    </button>
    
    <button class="btn-glow px-8 py-4 rounded-full font-space font-bold text-lg relative group">
      <span class="relative z-10">Buy AI Prompt Kit</span>
      <div class="absolute inset-0 rounded-full bg-gradient-to-r from-nebula-pink to-cosmic-purple opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
    </button>
  </div>
  
  <style>
    button {
      position: relative;
      overflow: visible;
    }
    
    button::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 9999px;
      padding: 2px;
      background: linear-gradient(135deg, #6b46c1, #ec4899);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: exclude;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    button:hover::after {
      opacity: 1;
    }
  </style>