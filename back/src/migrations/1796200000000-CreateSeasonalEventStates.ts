import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeasonalEventStates1796200000000 implements MigrationInterface {
  name = 'CreateSeasonalEventStates1796200000000';

  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`CREATE TABLE IF NOT EXISTS "seasonal_event_states" (
      "eventId" varchar NOT NULL,
      "startsAt" integer NOT NULL,
      "endsAt" integer NOT NULL,
      "status" varchar NOT NULL CHECK ("status" IN ('active','ended')),
      "activatedAt" integer NOT NULL,
      "endedAt" integer,
      PRIMARY KEY ("eventId", "startsAt")
    )`);
  }

  async down(): Promise<void> {
    // Retain real event history across application rollbacks.
  }
}
