import { STORAGE_KEY } from './storage';

const inactiveSnapshot = {
  activeSubject: null,
  activeChapterId: null,
  liveElapsedSeconds: 0,
};

let state = inactiveSnapshot;
let listeners = new Set();
let intervalId = null;
let storageReconcileHandler = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return state;
}

function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function stopTicking() {
  const wasTicking = intervalId !== null;
  const wasActive = state.activeChapterId !== null;

  if (intervalId !== null) {
    globalThis.clearInterval(intervalId);
  }

  intervalId = null;
  state = inactiveSnapshot;

  if (wasTicking || wasActive) {
    notify();
  }
}

function startTicking(subject, chapterId, accumulatedBeforeStartSeconds, startedAtEpochMs) {
  stopTicking();

  state = {
    activeSubject: subject,
    activeChapterId: chapterId,
    liveElapsedSeconds: accumulatedBeforeStartSeconds,
  };
  notify();

  intervalId = globalThis.setInterval(() => {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAtEpochMs) / 1000));

    state = {
      activeSubject: subject,
      activeChapterId: chapterId,
      liveElapsedSeconds: accumulatedBeforeStartSeconds + elapsedSeconds,
    };
    notify();
  }, 1000);
}

function isTicking() {
  return intervalId !== null;
}

function setStorageReconcileHandler(handler) {
  storageReconcileHandler = handler;

  return () => {
    if (storageReconcileHandler === handler) {
      storageReconcileHandler = null;
    }
  };
}

function isSameActiveTimer(incomingActiveTimer, current) {
  return (
    incomingActiveTimer?.subject === current.activeSubject &&
    incomingActiveTimer?.chapterId === current.activeChapterId
  );
}

function handleStorageEvent(event) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  if (event.newValue === null) {
    stopTicking();
    storageReconcileHandler?.({ type: 'storage-cleared' });
    return;
  }

  let incomingData;

  try {
    incomingData = JSON.parse(event.newValue);
  } catch (error) {
    console.warn('Unable to parse incoming JEE Planner storage event.', error);
    return;
  }

  const incomingActiveTimer = incomingData?.activeTimer ?? null;
  const current = getSnapshot();

  if (incomingActiveTimer === null) {
    if (current.activeChapterId !== null) {
      stopTicking();
    }

    storageReconcileHandler?.({ type: 'sync', incomingData });
    return;
  }

  if (isSameActiveTimer(incomingActiveTimer, current)) {
    storageReconcileHandler?.({ type: 'sync', incomingData });
    return;
  }

  const supersededTimer = current.activeChapterId
    ? { subject: current.activeSubject, chapterId: current.activeChapterId }
    : null;

  if (supersededTimer) {
    storageReconcileHandler?.({ type: 'superseded', incomingData, supersededTimer, reconciledAtEpochMs: Date.now() });
  } else {
    storageReconcileHandler?.({ type: 'sync', incomingData });
  }

  stopTicking();
  startTicking(
    incomingActiveTimer.subject,
    incomingActiveTimer.chapterId,
    incomingActiveTimer.accumulatedBeforeStartSeconds,
    incomingActiveTimer.startedAtEpochMs,
  );
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', handleStorageEvent);
}

// Manual V2B-4 cross-tab reconciliation test plan:
// 1. With two real browser tabs on the same origin, start chapter X in Tab A while Tab B is idle; Tab B should adopt X as running without a refresh.
// 2. With two real browser tabs, pause chapter X in Tab A after Tab B adopted it; Tab B should stop ticking without adding a duplicate credit.
// 3. With two real browser tabs, start chapter Y in Tab B, then start chapter X in Tab A; Tab B should credit Y once through the normal pause path, stop Y locally, and adopt X.
// 4. With two real browser tabs, start X in Tab A and start Y in Tab B before either observes the other; the last localStorage write wins as the active timer, while each superseded local timer is credited once by the tab that had it running.
// 5. Delete localStorage[STORAGE_KEY] in devtools from another tab; this tab should stop local ticking and not crash on the null storage value.
// 6. In single-tab usage, start/pause/reset timers normally; same-tab writes should not fire storage events, so behavior should be unchanged.

export const timerStore = {
  getSnapshot,
  subscribe,
  startTicking,
  stopTicking,
  isTicking,
  setStorageReconcileHandler,
};
