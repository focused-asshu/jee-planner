const inactiveSnapshot = {
  activeSubject: null,
  activeChapterId: null,
  liveElapsedSeconds: 0,
};

let state = inactiveSnapshot;
let listeners = new Set();
let intervalId = null;

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

export const timerStore = {
  getSnapshot,
  subscribe,
  startTicking,
  stopTicking,
  isTicking,
};
