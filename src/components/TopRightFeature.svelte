<script lang="ts">
  import { gsap } from 'gsap';
  let { feature }: {
    feature: {
      corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      title: string;
      description: string;
      icon: string;
    }
  } = $props();
  let expanded = $state(false);
  let showModal = $state(false);
  let triangleRef: HTMLDivElement | undefined;
  let modalRef: HTMLDivElement | undefined;

  function openModal() {
    showModal = true;
    expanded = false;
  }
  function closeModal() {
    showModal = false;
  }

  $effect(() => {
    if (expanded && triangleRef) {
      gsap.to(triangleRef, { scale: 1.15, duration: 0.3, ease: 'power2.out' });
    } else if (triangleRef) {
      gsap.to(triangleRef, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  });
  $effect(() => {
    if (showModal && modalRef) {
      gsap.fromTo(modalRef, { x: '100%', y: '-100%', opacity: 0 }, { x: '0%', y: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  });
</script>

<div
  bind:this={triangleRef}
  class="feature-triangle top-right"
  tabindex="0"
  onmouseenter={() => expanded = true}
  onmouseleave={() => expanded = false}
  onclick={openModal}
  style="position:fixed; top:0; right:0; width:40vw; height:40vh; z-index:30; cursor:pointer; pointer-events:auto;"
  aria-label={feature.title}
>
  <div class="feature-content">
    <span class="icon">{feature.icon}</span>
    <span class="title">{feature.title}</span>
  </div>
</div>

{#if showModal}
  <div bind:this={modalRef} class="feature-modal top-right-modal" style="position:fixed; top:0; left:0; right:0; bottom:0; z-index:60; background:rgba(20,16,40,0.97); display:flex; flex-direction:column; pointer-events:auto;" role="dialog" aria-modal="true">
    <button class="close-btn" style="position:absolute; top:1.5rem; right:1.5rem; z-index:70; font-size:2rem; background:none; border:none; color:white; cursor:pointer;" onclick={closeModal} aria-label="Close">✕</button>
    <div class="modal-content" style="margin:auto; color:white; text-align:center;">
      <div style="font-size:3rem;">{feature.icon}</div>
      <h2 style="font-size:2rem; margin:1rem 0;">{feature.title}</h2>
      <p style="font-size:1.2rem;">{feature.description}</p>
      <div style="margin-top:2rem;">(Filler modal content)</div>
    </div>
  </div>
{/if}

<style>
.feature-triangle.top-right {
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  background: linear-gradient(225deg, #ec4899cc 60%, #6b46c1cc 100%);
  transition: box-shadow 0.3s;
  box-shadow: 0 2px 16px 0 #0004;
  display: flex;
  align-items: flex-start;
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
}
.icon {
  font-size: 2rem;
}
.title {
  font-weight: bold;
}
.feature-modal.top-right-modal {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 