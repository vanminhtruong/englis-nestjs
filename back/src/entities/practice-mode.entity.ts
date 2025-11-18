import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('practice_modes')
export class PracticeMode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // 'flashcard', 'typing', 'multiple_choice', 'listening'

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string; // emoji or icon name

  @Column()
  color: string; // gradient colors like 'from-primary-500 to-secondary-500'

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
