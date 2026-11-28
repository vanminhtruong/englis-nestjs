import { DataSource } from 'typeorm';
import { SeasonalEventState } from '../../entities/seasonal-event-state.entity';
import { CreateSeasonalEventStates1796200000000 } from '../../migrations/1796200000000-CreateSeasonalEventStates';
import { SeasonalService } from './seasonal.service';

describe('Authoritative seasonal events', () => {
  let db: DataSource;
  beforeEach(async () => {
    db = await new DataSource({ type: 'better-sqlite3', database: ':memory:', entities: [SeasonalEventState] }).initialize();
    const runner = db.createQueryRunner();
    try {
      const migration = new CreateSeasonalEventStates1796200000000();
      await migration.up(runner);
      await migration.up(runner);
    } finally { await runner.release(); }
  });
  afterEach(async () => { jest.restoreAllMocks(); await db.destroy(); });

  it('persists nothing before the event, creates one occurrence and ends it at Vietnam midnight', async () => {
    const repo = db.getRepository(SeasonalEventState);
    const service = new SeasonalService(repo);
    const clock = jest.spyOn(Date, 'now');
    clock.mockReturnValue(Date.parse('2026-12-20T16:59:59Z'));
    expect((await service.getState()).active).toBeNull();
    expect(await repo.count()).toBe(0);
    const start = Date.parse('2026-12-20T17:00:00Z');
    const end = Date.parse('2026-12-27T17:00:00Z');
    clock.mockReturnValue(start);
    const replies = await Promise.all([service.getState(), service.getState(), service.getState()]);
    expect(replies.every(r => r.active?.eventId === 'christmas')).toBe(true);
    expect(await repo.find()).toEqual([{ eventId:'christmas', startsAt:start, endsAt:end, status:'active', activatedAt:start, endedAt:null }]);
    clock.mockReturnValue(start + 60000);
    expect((await new SeasonalService(repo).getState()).active?.activatedAt).toBe(start);
    clock.mockReturnValue(end);
    expect((await new SeasonalService(repo).getState()).active).toBeNull();
    expect(await repo.find()).toEqual([{ eventId:'christmas', startsAt:start, endsAt:end, status:'ended', activatedAt:start, endedAt:end }]);
  });

  it('keeps separate yearly occurrences and handles a lunar festival', async () => {
    const repo = db.getRepository(SeasonalEventState);
    const clock = jest.spyOn(Date, 'now');
    for (const timestamp of ['2026-02-17T03:00:00Z', '2027-02-06T03:00:00Z']) {
      clock.mockReturnValue(Date.parse(timestamp));
      expect((await new SeasonalService(repo).getState()).active?.eventId).toBe('tet');
    }
    const rows = await repo.find({ order: { startsAt: 'ASC' } });
    expect(rows.map(row => row.status)).toEqual(['ended','active']);
    expect(rows[0]!.endedAt).toBe(rows[0]!.endsAt);
    expect(rows[1]!.startsAt).toBeGreaterThan(rows[0]!.startsAt);
  });

  it('persists both occurrences when dates overlap, with correct individual end states', async () => {
    const repo = db.getRepository(SeasonalEventState);
    const clock = jest.spyOn(Date, 'now');
    const service = new SeasonalService(repo);
    clock.mockReturnValue(Date.parse('2023-04-29T05:00:00Z'));
    expect((await service.getState()).active?.eventId).toBe('hungKings');
    expect(await repo.countBy({ status: 'active' })).toBe(2);
    clock.mockReturnValue(Date.parse('2023-04-30T05:00:00Z'));
    expect((await service.getState()).active?.eventId).toBe('aprilMay');
    expect(await repo.countBy({ status: 'active' })).toBe(2);
    clock.mockReturnValue(Date.parse('2023-04-30T17:00:00Z'));
    expect((await service.getState()).active?.eventId).toBe('aprilMay');
    expect(await repo.countBy({ status: 'active' })).toBe(1);
    clock.mockReturnValue(Date.parse('2023-05-01T17:00:00Z'));
    expect((await service.getState()).active).toBeNull();
    expect(await repo.countBy({ status: 'ended' })).toBe(2);
  });
});
