# V2B-3 Manual Test Plan

This pass is a rendering-performance refactor only. Do not add schema data, multi-tab handling, or new UI while executing these checks.

1. **Render-count verification:** run the app in development, open React DevTools Profiler, start one chapter timer, record for 5 seconds, and verify the active row's `TimeStudiedCell`/floating timer updates every second while `ChapterTable` and inactive `ChapterRow` instances do not commit once per tick. As an optional console check, temporarily add `console.count(chapter.id)` inside `ChapterRowComponent`, repeat the test, and remove it before committing.
2. **V2A controls regression:** for an untouched chapter verify `Start`; while running verify `Pause` + `Reset`; after pausing verify `Resume` + `Reset`; after reset verify `Start` again.
3. **V2B-1 credit regression:** start/pause a timer and inspect localStorage to confirm `timeStudiedSeconds` and today's `dailySessions` increased by the same seconds; repeat with a handcrafted session spanning local midnight to confirm split date buckets still come from `creditTime`.
4. **V2B-2 short refresh recovery:** start a timer, refresh within 2 hours, and verify the recovered gap is credited, the same chapter still shows `Pause`, and live ticking resumes immediately through `timerStore`.
5. **V2B-2 stale refresh recovery:** edit `activeTimer.startedAtEpochMs` to more than 2 hours ago, refresh, and verify exactly 7200 seconds are credited, `activeTimer` is cleared, no timer is visible, and a temporary diagnostic import/log of `timerStore.isTicking()` reports `false` before that diagnostic is removed.
6. **Rapid click interval safety:** quickly click Start → Pause → Resume → Pause and verify only one timer display advances while active and the same temporary `timerStore.isTicking()` diagnostic reports `false` after the final pause before that diagnostic is removed.
7. **Switching chapters:** start chapter A, then start chapter B without pausing A; verify A is credited once, B becomes the only row showing `Pause` and ticking, and there is no frame where both rows visibly tick.
