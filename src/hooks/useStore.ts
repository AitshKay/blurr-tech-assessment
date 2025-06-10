import { useSyncExternalStore } from 'react';
import { StoreApi } from 'zustand';

export function useStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U,
  getServerSnapshot?: () => U
): U {
  const getSnapshot = () => selector(store.getState());
  
  return useSyncExternalStore(
    store.subscribe,
    getSnapshot,
    getServerSnapshot || getSnapshot
  );
}