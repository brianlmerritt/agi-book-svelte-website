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
  const motdHeight = 82; // px

  // AI Characters data
  type AICharacter = { name: string; description: string; img: string; };
  let aiCharacters = $state<AICharacter[]>([]);
  let selectedIdx = $state<number>(0);

  function open() {
    setOpenModal('bottom-left');
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
    if (openModal === 'bottom-left' && modalRef) {
      gsap.fromTo(modalRef, { x: '-100%', y: '100%', opacity: 0 }, { x: '0%', y: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  });
  $effect(() => {
    if (openModal === 'bottom-left' && aiCharacters.length === 0) {
      fetch('/data/ai_characters.json')
        .then(r => r.json())
        .then((data: AICharacter[]) => { aiCharacters = data; selectedIdx = 0; });
    }
  });
</script>

<div
  bind:this={triangleRef}
  class="feature-triangle bottom-left"
  tabindex="0"
  onmouseenter={() => expanded = true}
  onmouseleave={() => expanded = false}
  onclick={open}
  style={`position:fixed; bottom:${motdHeight}px; left:0; width:250px; height:250px; z-index:30; cursor:pointer; pointer-events:auto;`}
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

{#if openModal === 'bottom-left'}
  <div bind:this={modalRef} class="feature-modal bottom-left-modal" style={`position:fixed; top:72px; left:0; right:0; bottom:82px; z-index:60; background:rgba(20,16,40,0.97); display:flex; flex-direction:column; align-items:center; pointer-events:auto; max-width:90vw; margin:0 auto;`} role="dialog" aria-modal="true">
    <div style="margin:2rem auto 1rem auto; color:white; text-align:center;">
      <div style="font-size:2.2rem;">{feature.icon}</div>
      <h2 style="font-size:2rem; margin:0.5rem 0 1.5rem 0;">Meet the AIs</h2>
    </div>
    <div class="ais-row">
      {#each aiCharacters as ai, idx}
        <div class="ai-img-wrap {selectedIdx === idx ? 'selected' : ''}" onclick={() => selectedIdx = idx} tabindex="0" aria-label={ai.name}>
          <img src={ai.img} alt={ai.name} class="ai-img" />
        </div>
      {/each}
    </div>
    {#if aiCharacters[selectedIdx]}
      <div class="ai-info">
        <div class="ai-name">{aiCharacters[selectedIdx].name}</div>
        <div class="ai-desc">{aiCharacters[selectedIdx].description}</div>
      </div>
    {/if}
    <button class="close-btn" style="position:absolute; bottom:1.5rem; left:1.5rem; z-index:70; font-size:2rem; background:none; border:none; color:white; cursor:pointer;" onclick={close} aria-label="Close">✕</button>
  </div>
{/if}

<style>
.feature-triangle.bottom-left {
  clip-path: polygon(0 100%, 0 0, 100% 100%);
  background: linear-gradient(45deg, #6b46c1cc 60%, #ec4899cc 100%);
  transition: box-shadow 0.3s;
  box-shadow: 0 2px 16px 0 #0004;
  display: flex;
  align-items: flex-end;
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
.feature-modal.bottom-left-modal {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ais-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 1.2rem;
  margin: 0 auto 1.2rem auto;
  padding: 0.5rem 0;
  max-width: 100%;
  overflow-x: auto;
  min-height: 700px;
  max-height: 600px;
  overflow-y: auto;
  width: 95%;
}
.ai-img-wrap {
  width: 100px;
  height: 700px;
  border-radius: 1.5rem;
  overflow: hidden;
  background: #18122b;
  box-shadow: 0 2px 12px #0006;
  transition: width 0.45s cubic-bezier(.7,.2,.2,1), box-shadow 0.3s, border 0.3s;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  max-width: 90vw;
  flex-grow: 1;
}
.ai-img-wrap.selected {
  width: 350px;
  box-shadow: 0 4px 24px #ec4899cc, 0 2px 12px #0008;
  border: 2px solid #ec4899;
  z-index: 2;
}
@media (max-width: 900px) {
  .ai-img-wrap {
    height: 50vw;
    min-height: 220px;
    max-height: 70vw;
  }
  .ai-img-wrap.selected {
    width: 60vw;
    min-width: 180px;
    max-width: 90vw;
  }
}
.ai-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: filter 0.3s;
  display: block;
}
.ai-img-wrap:not(.selected) .ai-img {
  filter: grayscale(0.3) brightness(0.8);
}
.ai-info {
  margin: 0 auto 1.5rem auto;
  max-width: 600px;
  text-align: left;
  color: #fff;
}
.ai-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e0c3fc;
  margin-bottom: 0.5rem;
}
.ai-desc {
  font-size: 1.08rem;
  color: #fff;
  line-height: 1.6;
}
</style> 