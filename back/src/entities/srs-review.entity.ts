import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

@Entity('srs_reviews')
@Index('IDX_srs_reviews_user_date', ['userId', 'createdAt'])
export class SrsReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  vocabularyId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Relation<Vocabulary>;

  @Column({ type: 'text' })
  rating: SrsRating;

  @Column({ default: 0 })
  previousIntervalDays: number;

  @Column({ default: 0 })
  intervalDays: number;

  @Column({ type: 'datetime' })
  nextReviewAt: Date;

  // Distinguish self-practice from scheduled SRS reviews in the activity log.
  @Column({ default: false })
  isPracticeOnly: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
