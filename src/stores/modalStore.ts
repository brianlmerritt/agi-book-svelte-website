import { writable } from 'svelte/store';

// Modal state: can be 'top-left', 'top-right', 'bottom-left', 'bottom-right', or null
export const openModal = writable<string | null>(null);

// Optional: helper to set modal
export function setOpenModal(corner: string | null) {
  openModal.set(corner);
} 