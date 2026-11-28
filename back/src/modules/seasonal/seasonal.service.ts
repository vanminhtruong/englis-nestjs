import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { SeasonalEventState } from '../../entities/seasonal-event-state.entity';
import { getSeasonalSchedule, vietnamCalendarDay, millisecondsUntilVietnamMidnight } from './seasonal-calendar';

const DAY = 86_400_000;
const OFFSET = 7 * 60 * 60 * 1000;

@Injectable()
export class SeasonalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeasonalService.name);
  private timer?: ReturnType<typeof setTimeout>;
  private pending?: Promise<void>;
  private reconciledDay?: number;
  private stopped = false;

  constructor(@InjectRepository(SeasonalEventState) private readonly states: Repository<SeasonalEventState>) {}

  async onModuleInit() {
    await this.reconcile();
    this.scheduleNext();
  }

  onModuleDestroy() {
    this.stopped = true;
    clearTimeout(this.timer);
  }

  private scheduleNext() {
    if (this.stopped) return;
    clearTimeout(this.timer);
    const delay = Math.min(30_000, Math.max(1, millisecondsUntilVietnamMidnight(Date.now())));
    this.timer = setTimeout(async () => {
      try { await this.reconcile(); }
      catch (error) { this.logger.error('Seasonal state reconciliation failed', error instanceof Error ? error.stack : String(error)); }
      finally { this.scheduleNext(); }
    }, delay);
    this.timer.unref();
  }

  // The clock is always the server clock. There is no client write endpoint.
  async reconcile(now = Date.now()): Promise<void> {
    if (this.pending) {
      await this.pending;
      if (this.reconciledDay === vietnamCalendarDay(now)) return;
    }
    const day = vietnamCalendarDay(now);
    if (this.reconciledDay === day) return;
    const { activeEvents } = getSeasonalSchedule(day);
    const operation = this.states.manager.transaction(async manager => {
      const repo = manager.getRepository(SeasonalEventState);
      // Recover a missed end after a restart; record the scheduled end, not the restart time.
      await repo.createQueryBuilder().update()
        .set({ status: 'ended', endedAt: () => '"endsAt"' })
        .where({ status: 'active', endsAt: LessThanOrEqual(now) }).execute();
      for (const active of activeEvents) {
        const startsAt = active.start - OFFSET;
        const endsAt = active.end + DAY - OFFSET;
        // One record per occurrence, even across simultaneous requests or restarts.
        await repo.createQueryBuilder().insert().values({
          eventId: active.id, startsAt, endsAt, status: 'active', activatedAt: now, endedAt: null,
        }).orIgnore().execute();
      }
    });
    this.pending = operation;
    try {
      await operation;
      this.reconciledDay = day;
    } finally {
      if (this.pending === operation) this.pending = undefined;
    }
  }

  async getState() {
    const now = Date.now();
    await this.reconcile(now);
    const schedule = getSeasonalSchedule(vietnamCalendarDay(now));
    const event = schedule.active;
    const record = event ? await this.states.findOneBy({ eventId: event.id, startsAt: event.start - OFFSET, status: 'active' }) : null;
    return {
      serverNow: now,
      nextSyncAt: now + millisecondsUntilVietnamMidnight(now),
      active: record && event ? { event, ...record } : null,
    };
  }
}
