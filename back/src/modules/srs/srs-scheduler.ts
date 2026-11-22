import { SrsRating } from '../../entities/srs-review.entity';

export interface SrsScheduleState {
  repetitions: number;
  lapses: number;
  intervalDays: number;
  easeFactor: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * A lightweight SM-2-inspired scheduler. Every rating is intentional and
 * server-authoritative; the client never sends scheduling parameters.
 */
export function calculateSrsSchedule(
  previous: SrsScheduleState,
  rating: SrsRating,
  now: Date = new Date(),
): SrsScheduleState & { nextReviewAt: Date } {
  let repetitions = previous.repetitions;
  let lapses = previous.lapses;
  let intervalDays = previous.intervalDays;
  let easeFactor = previous.easeFactor;
  let delayMs: number;

  if (rating === 'again') {
    repetitions = 0;
    lapses += 1;
    intervalDays = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    delayMs = MINUTE_MS;
  } else if (rating === 'hard') {
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    if (repetitions === 0) {
      intervalDays = 0;
      delayMs = 10 * MINUTE_MS;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      delayMs = intervalDays * DAY_MS;
    }
  } else {
    repetitions += 1;
    if (rating === 'easy') {
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      intervalDays =
        previous.repetitions === 0
          ? 4
          : Math.max(4, Math.round(previous.intervalDays * easeFactor * 1.3));
    } else {
      intervalDays =
        previous.repetitions === 0
          ? 1
          : previous.repetitions === 1
            ? 3
            : Math.max(
                previous.intervalDays + 1,
                Math.round(previous.intervalDays * easeFactor),
              );
    }
    intervalDays = Math.min(3650, intervalDays);
    delayMs = intervalDays * DAY_MS;
  }

  return {
    repetitions,
    lapses,
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    nextReviewAt: new Date(now.getTime() + delayMs),
  };
}
