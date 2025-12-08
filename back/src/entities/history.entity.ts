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

export enum HistoryAction {
  VOCABULARY_CREATED = 'vocabulary_created',
  VOCABULARY_UPDATED = 'vocabulary_updated',
  VOCABULARY_DELETED = 'vocabulary_deleted',
  PRACTICE_FLASHCARD = 'practice_flashcard',
  PRACTICE_MULTIPLE_CHOICE = 'practice_multiple_choice',
  PRACTICE_TYPING = 'practice_typing',
  PRACTICE_LISTENING = 'practice_listening',
  PRACTICE_BALL_SHOOTING = 'practice_ball_shooting',
}

@Entity('histories')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  vocabularyId: string;

  @Column({
    type: 'text',
  })
  action: HistoryAction;

  // Lưu thông tin chi tiết về action
  @Column({
    type: 'text', nullable: true, transformer: {
      to: (value: any) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : null,
    }
  })
  metadata: {
    // For vocabulary actions
    word?: string;
    translation?: string;
    oldWord?: string;
    newWord?: string;
    oldTranslation?: string;
    newTranslation?: string;

    // For practice actions
    practiceType?: string;
    isCorrect?: boolean;
    score?: number;
    timeSpent?: number;
    userAnswer?: string;
  };

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Vocabulary, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Vocabulary;

  @CreateDateColumn()
  createdAt: Date;
}
