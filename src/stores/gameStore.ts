import { writable } from 'svelte/store';

/**
 * Defines the shape of the data managed by the game store.
 */
interface GameState {
  score: number;
}

/**
 * Creates a custom Svelte store for managing the game's state,
 * such as the player's score.
 */
function createGameStore() {
  // Initialize the store with a writable instance, typed with GameState.
  const { subscribe, set, update } = writable<GameState>({
    score: 0,
  });

  return {
    /**
     * Svelte's subscribe method to make the store reactive.
     */
    subscribe,

    /**
     * Adds a specified number of points to the current score.
     * @param {number} points - The number of points to add.
     */
    addScore: (points: number) => {
      update(state => {
        const newScore = state.score + points;
        console.log(`Added ${points} points. New score: ${newScore}`);
        return { ...state, score: newScore };
      });
    },

    /**
     * Resets the score back to zero.
     */
    resetScore: () => {
      console.log('Resetting score to 0');
      set({ score: 0 });
    }
  };
}

/**
 * The exported game store instance.
 */
export const gameStore = createGameStore();
