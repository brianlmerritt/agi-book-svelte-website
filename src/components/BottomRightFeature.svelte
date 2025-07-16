<script lang="ts">
  import { gsap } from 'gsap';
  let { feature, layout, openModal, setOpenModal }: {
    feature: {
      corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      title: string;
      description: string;
      icon: string;
    },
    layout: 'top' | 'bottom',
    openModal: string | null,
    setOpenModal: (corner: string | null) => void
  } = $props();
  let expanded = $state(false);
  let triangleRef: HTMLDivElement | undefined;
  let modalRef = $state<HTMLDivElement | undefined>(undefined);
  const motdHeight = 82; // px

  function open() {
    setOpenModal('bottom-right');
    expanded = false;
  }
  function close() {
    setOpenModal(null);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  }

  $effect(() => {
    if (expanded && triangleRef) {
      gsap.to(triangleRef, { scale: 1.15, duration: 0.3, ease: 'power2.out' });
    } else if (triangleRef) {
      gsap.to(triangleRef, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  });
  $effect(() => {
    if (openModal === 'bottom-right' && modalRef) {
      gsap.fromTo(modalRef, { x: '100%', y: '100%', opacity: 0 }, { x: '0%', y: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  });
</script>

<div
  bind:this={triangleRef}
  class="feature-triangle bottom-right"
  role="button"
  tabindex="0"
  onmouseenter={() => expanded = true}
  onmouseleave={() => expanded = false}
  onclick={open}
  onkeydown={handleKeyDown}
  style={`position:fixed; bottom:${motdHeight}px; right:0; width:250px; height:250px; z-index:30; cursor:pointer; pointer-events:auto;`}
  aria-label={feature.title}
>
  <div class="feature-content">
    {#if layout === 'bottom'}
      <span class="icon">{feature.icon}</span>
      <span class="title">{feature.title}</span>
    {:else}
      <span class="title">{feature.title}</span>
      <span class="icon">{feature.icon}</span>
    {/if}
  </div>
</div>

{#if openModal === 'bottom-right'}
  <div bind:this={modalRef} class="feature-modal bottom-right-modal" style={`position:fixed; top:72px; left:0; right:0; bottom:82px; z-index:60; background-color:rgba(20,16,40,0.97); background-image:url('/assets/worlds/earth_circuit_board.png'); background-size:cover; background-position:center; background-repeat:no-repeat; display:flex; flex-direction:column; pointer-events:auto;`} role="dialog" aria-modal="true">
    <button class="close-btn" style="position:absolute; bottom:1.5rem; right:1.5rem; z-index:70; font-size:2rem; background:none; border:none; color:white; cursor:pointer;" onclick={close} aria-label="Close">✕</button>
    <div class="modal-content" style="margin:auto; color:white; text-align:center; background-color:#4A90E2; border:3px solid #FFD700; border-radius:20px; padding:2rem; max-width:600px; box-shadow:0 8px 24px rgba(0,0,0,0.3);">
      {#if layout === 'bottom'}
        <div style="font-size:3rem;">{feature.icon}</div>
        <h2 style="font-size:2rem; margin:1rem 0;">{feature.title}</h2>
      {:else}
        <h2 style="font-size:2rem; margin:1rem 0;">{feature.title}</h2>
        <div style="font-size:3rem;">{feature.icon}</div>
      {/if}
      <p style="font-size:1.2rem;">{feature.description}</p>
      <div style="margin-top:2rem; font-size:2rem;">Coming Soon!</div>
    </div>
  </div>
{/if}

<style>
.feature-triangle.bottom-right {
  clip-path: polygon(100% 100%, 0 100%, 100% 0);
  background: linear-gradient(315deg, #ec4899cc 60%, #6b46c1cc 100%);
  transition: box-shadow 0.3s;
  box-shadow: 0 2px 16px 0 #0004;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 2vw;
}
.feature-content {
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  text-align: right;
}
.icon {
  font-size: 2rem;
}
.title {
  font-weight: bold;
}
.feature-modal.bottom-right-modal {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 