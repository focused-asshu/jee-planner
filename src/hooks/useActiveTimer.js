import { useSyncExternalStore } from 'react';
import { timerStore } from '../lib/timerStore';

export function useActiveTimer() {
  return useSyncExternalStore(timerStore.subscribe, timerStore.getSnapshot, timerStore.getSnapshot);
}
