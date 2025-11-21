import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum MasteryLevel {
  NEW = 'new',
  LEARNING = 'learning',
  FAMILIAR = 'familiar',
  MASTERED = 'mastered',
}

@Entity('vocabularies')
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column()
  pronunciation: string;

  @Column()
  meaning: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({ type: 'text', nullable: true })
  exampleTranslation: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  video: string;

  @Column({ nullable: true })
  audio: string;

  @Column({
    type: 'text',
    default: DifficultyLevel.EASY,
  })
  difficulty: DifficultyLevel;

  @Column({
    type: 'text',
    default: MasteryLevel.NEW,
  })
  masteryLevel: MasteryLevel;

  @Column({ default: 0 })
  correctCount: number;

  @Column({ default: 0 })
  incorrectCount: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'datetime', nullable: true })
  pinnedAt: Date | null;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.vocabularies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Category, (category) => category.vocabularies)
  @JoinTable({
    name: 'vocabulary_categories',
    joinColumn: { name: 'vocabularyId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastReviewedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  nextReviewAt: Date;
}
