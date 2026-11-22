import { calculateSrsSchedule } from './srs-scheduler';

const initial = { repetitions: 0, lapses: 0, easeFactor: 2.5, intervalDays: 0 };
const now = new Date('2026-11-20T12:00:00Z');

describe('SRS scheduler', () => {
  it('retries forgotten words after one minute', () => {
    const result = calculateSrsSchedule(initial, 'again', now);
    expect(result.repetitions).toBe(0);
    expect(result.lapses).toBe(1);
    expect(result.nextReviewAt.toISOString()).toBe('2026-11-20T12:01:00.000Z');
  });

  it('schedules hard new words after ten minutes', () => {
    const result = calculateSrsSchedule(initial, 'hard', now);
    expect(result.intervalDays).toBe(0);
    expect(result.nextReviewAt.toISOString()).toBe('2026-11-20T12:10:00.000Z');
  });

  it('graduates good words from 1 to 3 days', () => {
    const first = calculateSrsSchedule(initial, 'good', now);
    const second = calculateSrsSchedule(first, 'good', now);
    expect(first.intervalDays).toBe(1);
    expect(second.intervalDays).toBe(3);
    expect(second.repetitions).toBe(2);
  });

  it('schedules easy words later and never increases ease beyond cap', () => {
    const result = calculateSrsSchedule(
      { ...initial, easeFactor: 3 },
      'easy',
      now,
    );
    expect(result.intervalDays).toBe(4);
    expect(result.easeFactor).toBe(3);
  });

  it('resets a lapsed card but retains the history of failures', () => {
    const result = calculateSrsSchedule(
      { ...initial, intervalDays: 12, repetitions: 4, lapses: 2 },
      'again',
      now,
    );
    expect(result.lapses).toBe(3);
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(0);
  });
});
