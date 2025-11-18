import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Vocabulary } from './vocabulary.entity';
import { PracticeHistory } from './practice-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ default: 0 })
  totalScore: number;

  @Column({ default: 0 })
  totalWords: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'grid' })
  vocabularyLayout: 'grid' | 'list';

  @Column({ type: 'text', nullable: true })
  preferredVoiceKey: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.user)
  vocabularies: Vocabulary[];

  @OneToMany(() => PracticeHistory, (history) => history.user)
  practiceHistories: PracticeHistory[];
}
