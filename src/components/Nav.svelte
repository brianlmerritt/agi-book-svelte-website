<script lang="ts">
    import { MediaQuery } from 'svelte/reactivity';
    import { setOpenModal } from '../stores/modalStore';
    
    let mobileMenuOpen = $state(false);
    const mobileQuery = new MediaQuery('(max-width: 768px)');

    function resetPage() {
      window.location.reload();
    }

    function openFeatureModal(corner: string) {
      setOpenModal(corner);
    }
</script>

  <nav role="region" class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-nebula-pink/90 to-cosmic-purple/90 backdrop-blur-md border-b border-star-white/20">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-gradient-to-r from-cosmic-purple to-nebula-pink rounded-full animate-pulse"></div>
          <button class="text-2xl font-bold font-space text-white bg-clip-text bg-gradient-to-r from-white via-cosmic-purple/60 to-nebula-pink/60 cursor-pointer bg-transparent border-none" onclick={resetPage} onkeydown={(e) => e.key === 'Enter' && resetPage()} aria-label="Reset page">
            AGI:theBook
          </button>
        </div>
        
        <!-- Desktop Menu -->
        {#if !mobileQuery.current}
          <div class="flex items-center space-x-6">
            <button class="hover:text-nebula-pink transition-colors bg-transparent border-none text-white" onclick={() => openFeatureModal('top-left')}>Read Chapter 1</button>
            <button class="hover:text-nebula-pink transition-colors bg-transparent border-none text-white" onclick={() => openFeatureModal('top-right')}>Meet the Humans</button>
            <button class="hover:text-nebula-pink transition-colors bg-transparent border-none text-white" onclick={() => openFeatureModal('bottom-left')}>Meet the AI Characters</button>
            <button class="hover:text-nebula-pink transition-colors bg-transparent border-none text-white" onclick={() => openFeatureModal('bottom-right')}>Buy the AI Prompt Kit</button>
            <button
              class="w-10 h-10 rounded-full bg-gradient-to-r from-cosmic-purple to-nebula-pink p-0.5"
              aria-label="Open menu"
            >
              <div class="w-full h-full bg-space-blue rounded-full flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </button>
          </div>
        {:else}
          <!-- Mobile Menu Button -->
          <button 
            onclick={() => mobileMenuOpen = !mobileMenuOpen}
            class="p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if mobileMenuOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>
        {/if}
      </div>
      
      <!-- Mobile Menu -->
      {#if mobileQuery.current && mobileMenuOpen}
        <div class="mt-4 pt-4 border-t border-cosmic-purple/20 space-y-3">
          <button class="block hover:text-nebula-pink transition-colors bg-transparent border-none text-white text-left" onclick={() => openFeatureModal('top-left')}>Read Chapter 1</button>
          <button class="block hover:text-nebula-pink transition-colors bg-transparent border-none text-white text-left" onclick={() => openFeatureModal('top-right')}>Meet the Humans</button>
          <button class="block hover:text-nebula-pink transition-colors bg-transparent border-none text-white text-left" onclick={() => openFeatureModal('bottom-left')}>Meet the AI Characters</button>
          <button class="block hover:text-nebula-pink transition-colors bg-transparent border-none text-white text-left" onclick={() => openFeatureModal('bottom-right')}>Buy the AI Prompt Kit</button>
        </div>
      {/if}
    </div>
  </nav>