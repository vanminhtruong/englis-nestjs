import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('password_reset_challenges')
export class PasswordResetChallenge {
  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  codeHash: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'datetime' })
  lastSentAt: Date;

  @Column({ type: 'integer', default: 0 })
  attempts: number;
}
