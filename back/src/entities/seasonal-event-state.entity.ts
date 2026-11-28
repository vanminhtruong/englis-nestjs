import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('seasonal_event_states')
export class SeasonalEventState {
  @PrimaryColumn({ type: 'varchar' })
  eventId: string;

  @PrimaryColumn({ type: 'integer' })
  startsAt: number;

  @Column({ type: 'integer' })
  endsAt: number;

  @Column({ type: 'varchar' })
  status: 'active' | 'ended';

  @Column({ type: 'integer' })
  activatedAt: number;

  @Column({ type: 'integer', nullable: true })
  endedAt: number | null;
}
