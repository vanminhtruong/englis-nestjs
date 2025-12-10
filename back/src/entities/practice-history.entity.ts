import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

export enum PracticeType {
  FLASHCARD = 'flashcard',
  MULTIPLE_CHOICE = 'multiple_choice',
  TYPING = 'typing',
  LISTENING = 'listening',
  IMAGE_GUESS = 'image_guess',
  BALL_SHOOTING = 'ball_shooting',
  SNAKE = 'snake',
}

@Entity('practice_histories')
export class PracticeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  vocabularyId: string;

  @Column({
    type: 'text',
  })
  practiceType: PracticeType;

  @Column()
  isCorrect: boolean;

  @Column({ nullable: true })
  userAnswer: string;

  @Column({ default: 0 })
  timeSpent: number; // seconds

  @Column({ default: 0 })
  score: number;

  @ManyToOne(() => User, (user) => user.practiceHistories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Vocabulary;

  @CreateDateColumn()
  createdAt: Date;
}
