import { useEffect, useState } from 'react';
import { timerStore } from '../lib/timerStore';
import { loadData, pauseActiveTimer, resetChapterTimer, saveData, startChapterTimer, updateChapterField } from '../lib/storage';

export function useTimer() {
  const [plannerData, setPlannerData] = useState(() => loadData());


  useEffect(() => {
    const unsubscribe = timerStore.setStorageReconcileHandler((event) => {
      if (event.type === 'storage-cleared') {
        setPlannerData((currentData) => ({ ...currentData, activeTimer: null }));
        return;
      }

      if (event.type === 'superseded') {
        setPlannerData((currentData) => {
          const localActiveTimer = currentData.activeTimer;
          const hasSameLocalTimer =
            localActiveTimer?.subject === event.supersededTimer.subject &&
            localActiveTimer?.chapterId === event.supersededTimer.chapterId;

          if (!hasSameLocalTimer) {
            return event.incomingData;
          }

          const pausedData = pauseActiveTimer(currentData, event.reconciledAtEpochMs);
          const nextData = {
            ...event.incomingData,
            subjects: pausedData.subjects,
            dailySessions: pausedData.dailySessions,
          };

          saveData(nextData);
          return nextData;
        });
        return;
      }

      setPlannerData(event.incomingData);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const { activeTimer } = plannerData;

    if (!activeTimer) {
      timerStore.stopTicking();
      return undefined;
    }

    timerStore.startTicking(
      activeTimer.subject,
      activeTimer.chapterId,
      activeTimer.accumulatedBeforeStartSeconds,
      activeTimer.startedAtEpochMs,
    );

    return () => {
      timerStore.stopTicking();
    };
  }, [plannerData.activeTimer]);

  const handleFieldChange = (subject, chapterId, field, value) => {
    setPlannerData((currentData) => updateChapterField(currentData, subject, chapterId, field, value));
  };

  const handleTimerStart = (subject, chapterId) => {
    const startedAtEpochMs = Date.now();
    setPlannerData((currentData) => startChapterTimer(currentData, subject, chapterId, startedAtEpochMs));
  };

  const handleTimerPause = () => {
    const pausedAtEpochMs = Date.now();
    timerStore.stopTicking();
    setPlannerData((currentData) => pauseActiveTimer(currentData, pausedAtEpochMs));
  };

  const handleTimerReset = (subject, chapterId) => {
    setPlannerData((currentData) => {
      const nextData = resetChapterTimer(currentData, subject, chapterId);

      if (!nextData.activeTimer) {
        timerStore.stopTicking();
      }

      return nextData;
    });
  };

  return {
    plannerData,
    handleFieldChange,
    handleTimerStart,
    handleTimerPause,
    handleTimerReset,
  };
}
