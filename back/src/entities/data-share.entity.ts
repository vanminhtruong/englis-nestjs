import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DataShareStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

/**
 * A snapshot of one user's vocabulary data offered to another user.
 * The recipient must accept it before anything is written to their account.
 */
@Entity('data_shares')
@Index('IDX_data_shares_recipient_status', ['recipientId', 'status'])
@Index('IDX_data_shares_sender_status', ['senderId', 'status'])
export class DataShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column()
  recipientEmail: string;

  @Column({ type: 'text', default: 'pending' })
  status: DataShareStatus;

  /** JSON: { vocabularies: [...], histories: [...] } captured when sent. */
  @Column({ type: 'text' })
  payload: string;

  @Column({ default: 0 })
  vocabularyCount: number;

  @Column({ default: 0 })
  historyCount: number;

  /** JSON stats of what was merged once the recipient accepted. */
  @Column({ type: 'text', nullable: true })
  resultStats: string | null;

  /** JSON counts of categories, tags, tabs, topics and Smart review rows in the offer. */
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  respondedAt: Date | null;
}
