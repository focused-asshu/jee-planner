# V2B-3 Manual Test Plan

This pass is a rendering-performance refactor only. Do not add schema data, multi-tab handling, or new UI while executing these checks.

1. **Render-count verification:** run the app in development, open React DevTools Profiler, start one chapter timer, record for 5 seconds, and verify the active row's `TimeStudiedCell`/floating timer updates every second while `ChapterTable` and inactive `ChapterRow` instances do not commit once per tick. As an optional console check, temporarily add `console.count(chapter.id)` inside `ChapterRowComponent`, repeat the test, and remove it before committing.
2. **V2A controls regression:** for an untouched chapter verify `Start`; while running verify `Pause` + `Reset`; after pausing verify `Resume` + `Reset`; after reset verify `Start` again.
3. **V2B-1 credit regression:** start/pause a timer and inspect localStorage to confirm `timeStudiedSeconds` and today's `dailySessions` increased by the same seconds; repeat with a handcrafted session spanning local midnight to confirm split date buckets still come from `creditTime`.
4. **V2B-2 short refresh recovery:** start a timer, refresh within 2 hours, and verify the recovered gap is credited, the same chapter still shows `Pause`, and live ticking resumes immediately through `timerStore`.
5. **V2B-2 stale refresh recovery:** edit `activeTimer.startedAtEpochMs` to more than 2 hours ago, refresh, and verify exactly 7200 seconds are credited, `activeTimer` is cleared, no timer is visible, and a temporary diagnostic import/log of `timerStore.isTicking()` reports `false` before that diagnostic is removed.
6. **Rapid click interval safety:** quickly click Start → Pause → Resume → Pause and verify only one timer display advances while active and the same temporary `timerStore.isTicking()` diagnostic reports `false` after the final pause before that diagnostic is removed.
7. **Switching chapters:** start chapter A, then start chapter B without pausing A; verify A is credited once, B becomes the only row showing `Pause` and ticking, and there is no frame where both rows visibly tick.

## V3A Manual Test Plan

This pass adds a read-only Dashboard and pure committed-time stats. Do not add streak checks here; streaks and live-ticking dashboard totals are deferred to V3B.

1. **Fresh install dashboard:** clear `localStorage["jee-planner-data"]`, reload the app, and verify the default Dashboard shows `0 / 120` completed, `0m 0s` for total study time and today's study time, and no crash with an empty `dailySessions` object.
2. **Independent subject completion:** mark one Physics chapter complete by checking Lectures, PYQs, Allen Module, Notes Revision, and setting Test Status to Strong; verify Dashboard total becomes `1 / 120`, Physics shows `1 / 40`, and Chemistry/Maths remain `0 / 40`.
3. **Shared completion source:** switch to Study Planner and verify the header's `Completed: X / Y` value for the active subject matches the corresponding Dashboard subject row, then switch back and verify the Dashboard total still matches the sum of all subject rows.
4. **Top-level view switching:** switch repeatedly between Dashboard and Study Planner, change subjects/search text in Study Planner, and verify no errors or data loss occur and the Study Planner table/controls behave as before.
5. **No live-ticking dashboard totals:** start a chapter timer, navigate to Dashboard, wait several seconds, and verify Total Study Hours and Today's Study Time do not tick upward until the timer is paused/credited from the Study Planner or floating timer controls.
6. **Pure stats functions:** from a temporary console/import harness, call `getCompletionStats`, `getTotalStudySeconds`, and `getTodayCommittedSeconds` with a handcrafted `plannerData` object and verify the returned plain values match the supplied chapter completion, summed `timeStudiedSeconds`, and `dailySessions[todayKey].totalSeconds` without needing React or timer state.
7. **Shared local date key:** start and pause a same-day timer, inspect the written `dailySessions` key in localStorage, and verify `getTodayCommittedSeconds` reads that exact key via the exported `getLocalDateKey` helper from `storage.js` rather than a separate date-key implementation.
