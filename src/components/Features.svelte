<script lang="ts">
    import { gsap } from 'gsap';
    import { useIntersectionObserver } from 'runed';
    
    interface Feature {
      icon: string;
      title: string;
      description: string;
    }
    
    const features: Feature[] = [
      {
        icon: '🌌',
        title: 'Immersive World',
        description: 'Dive into a richly detailed universe where AI consciousness awakens and humanity faces its greatest evolution.'
      },
      {
        icon: '🤖',
        title: 'AI-Written Narrative',
        description: 'Experience a story crafted by advanced AI, exploring themes of consciousness, identity, and transcendence.'
      },
      {
        icon: '💫',
        title: 'Interactive Prompts',
        description: 'Shape the narrative with AI prompt tools. Create your own chapters and explore alternate storylines.'
      }
    ];
    
    let featuresRef: HTMLElement;
    let hasAnimated = false;
    
    $: if (featuresRef) {
      useIntersectionObserver(
        featuresRef,
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimated) {
            hasAnimated = true;
            gsap.from('.feature-card', {
              y: 50,
              opacity: 0,
              duration: 1,
              stagger: 0.2,
              ease: 'power3.out'
            });
          }
        },
        { threshold: 0.2 }
      );
    }
</script>

<section bind:this={featuresRef} class="relative py-20 px-4">
  <div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each features as feature}
        <div class="feature-card group">
          <div class="relative h-full p-8 rounded-2xl bg-gradient-to-br from-cosmic-purple/10 to-nebula-pink/10 border border-cosmic-purple/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-nebula-pink/40">
            <!-- Glow effect -->
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-cosmic-purple/20 to-nebula-pink/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            
            <div class="relative z-10">
              <div class="text-5xl mb-4">{feature.icon}</div>
              <h3 class="text-2xl font-space font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-star-white to-nebula-pink">
                {feature.title}
              </h3>
              <p class="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .feature-card {
    position: relative;
  }
  
  .feature-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 1rem;
    padding: 1px;
    background: linear-gradient(135deg, transparent, #6b46c1, #ec4899, transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: exclude;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .feature-card:hover::before {
    opacity: 1;
    animation: rotate-gradient 3s linear infinite;
  }
  
  @keyframes rotate-gradient {
    to {
      transform: rotate(360deg);
    }
  }
</style>