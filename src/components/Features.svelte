<script lang="ts">
    import { gsap } from 'gsap';
    import { useIntersectionObserver } from 'runed';
    import TopLeftFeature from './TopLeftFeature.svelte';
    import TopRightFeature from './TopRightFeature.svelte';
    import BottomLeftFeature from './BottomLeftFeature.svelte';
    import BottomRightFeature from './BottomRightFeature.svelte';
    import featuresData from '../data/features.json';
    import { openModal, setOpenModal } from '../stores/modalStore';
    
    type Feature = {
      corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      title: string;
      description: string;
      icon: string;
    };
    const features = featuresData as Feature[];
    
    let featuresRef: HTMLElement;
    let hasAnimated = false;
    
    // Find features by corner
    const topLeft = features.find(f => f.corner === 'top-left');
    const topRight = features.find(f => f.corner === 'top-right');
    const bottomLeft = features.find(f => f.corner === 'bottom-left');
    const bottomRight = features.find(f => f.corner === 'bottom-right');
    
    // Use $openModal from store
    $: $openModal;
    
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

<!-- Top features: z-index 30 (below nav) -->
<div style="position:fixed; inset:0; pointer-events:none; z-index:30;">
  {#if topLeft}
    <TopLeftFeature feature={topLeft} layout="top" openModal={$openModal} setOpenModal={setOpenModal as (corner: string | null) => void} />
  {/if}
  {#if topRight}
    <TopRightFeature feature={topRight} layout="top" openModal={$openModal} setOpenModal={setOpenModal as (corner: string | null) => void} />
  {/if}
</div>

<!-- Bottom features: z-index 70 (above motd) -->
{#if $openModal !== 'top-left' && $openModal !== 'top-right'}
  <div style="position:fixed; inset:0; pointer-events:none; z-index:70;">
    {#if bottomLeft}
      <BottomLeftFeature feature={bottomLeft} layout="bottom" openModal={$openModal} setOpenModal={setOpenModal as (corner: string | null) => void} />
    {/if}
    {#if bottomRight}
      <BottomRightFeature feature={bottomRight} layout="bottom" openModal={$openModal} setOpenModal={setOpenModal as (corner: string | null) => void} />
    {/if}
  </div>
{/if}

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
                {@html feature.title.replace(/\n/g, '<br>')}
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

  :global(body) {
    overflow: hidden;
  }
</style>