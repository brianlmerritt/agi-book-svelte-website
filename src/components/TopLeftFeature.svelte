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
  let modalRef: HTMLDivElement | undefined;
  const navHeight = 72; // px

  function open() {
    setOpenModal('top-left');
    expanded = false;
  }
  function close() {
    setOpenModal(null);
  }

  $effect(() => {
    if (expanded && triangleRef) {
      gsap.to(triangleRef, { scale: 1.15, duration: 0.3, ease: 'power2.out' });
    } else if (triangleRef) {
      gsap.to(triangleRef, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  });
  $effect(() => {
    if (openModal === 'top-left' && modalRef) {
      gsap.fromTo(modalRef, { x: '-100%', y: '-100%', opacity: 0 }, { x: '0%', y: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  });
</script>

<div
  bind:this={triangleRef}
  class="feature-triangle top-left"
  tabindex="0"
  onmouseenter={() => expanded = true}
  onmouseleave={() => expanded = false}
  onclick={open}
  style={`position:fixed; top:${navHeight}px; left:0; width:250px; height:250px; z-index:30; cursor:pointer; pointer-events:auto;`}
  aria-label={feature.title}
>
  <div class="feature-content">
    {#if layout === 'top'}
      <span class="title">{feature.title}</span>
      <span class="icon">{feature.icon}</span>
    {:else}
      <span class="icon">{feature.icon}</span>
      <span class="title">{feature.title}</span>
    {/if}
  </div>
</div>

{#if openModal === 'top-left'}
  <div bind:this={modalRef} class="feature-modal top-left-modal" style={`position:fixed; top:${navHeight}px; left:0; right:0; bottom:82px; z-index:60; background:rgba(20,16,40,0.97); display:flex; flex-direction:column; pointer-events:auto;`} role="dialog" aria-modal="true">
    <button class="close-btn" style="position:absolute; top:1.5rem; left:1.5rem; z-index:70; font-size:2rem; background:none; border:none; color:white; cursor:pointer;" onclick={close} aria-label="Close">✕</button>
    <div class="modal-content" style="margin:auto; color:white; text-align:center;">
      {#if layout === 'top'}
        <h2 style="font-size:2rem; margin:1rem 0;">{feature.title}</h2>
        <div style="font-size:3rem;">{feature.icon}</div>
      {:else}
        <div style="font-size:3rem;">{feature.icon}</div>
        <h2 style="font-size:2rem; margin:1rem 0;">{feature.title}</h2>
      {/if}
      <p style="font-size:1.2rem;">{feature.description}</p>
      <div style="margin-top:2rem;">(Filler modal content)</div>
    </div>
  </div>
{/if}

<style>
.feature-triangle.top-left {
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: linear-gradient(225deg, #ec4899cc 60%, #6b46c1cc 100%);
  transition: box-shadow 0.3s;
  box-shadow: 0 2px 16px 0 #0004;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 2vw;
}
.feature-content {
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}
.icon {
  font-size: 2rem;
}
.title {
  font-weight: bold;
}
.feature-modal.top-left-modal {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 