import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('srs_progress')
@Index('UQ_srs_user_word', ['userId', 'vocabularyId'], { unique: true })
@Index('IDX_srs_user_due', ['userId', 'nextReviewAt'])
export class SrsProgress {
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

  @Column({ default: 0 })
  repetitions: number;

  @Column({ default: 0 })
  lapses: number;

  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @Column({ default: 0 })
  intervalDays: number;

  @Column({ type: 'datetime' })
  nextReviewAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastReviewedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
