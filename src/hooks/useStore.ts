import { useSyncExternalStore, useMemo } from 'react';
import { StoreApi } from 'zustand';

export function useStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U
): U {
  const state = store.getState();
  
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(state) // Use initial state for SSR
  );
}