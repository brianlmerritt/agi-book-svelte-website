declare module '*.svelte' {
  import { SvelteComponentTyped } from 'svelte';
  export default class extends SvelteComponentTyped<any, any, any> {}
}

declare module '../data/messages.json' {
  interface Message {
    text: string;
    img: string;
  }
  const messages: Message[];
  export default messages;
}

declare module 'three'; 