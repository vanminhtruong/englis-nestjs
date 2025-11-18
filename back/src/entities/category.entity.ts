import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  color: string; // Mã màu hex cho UI

  @Column({ nullable: true })
  icon: string; // Icon emoji hoặc tên icon

  @Column({ default: false })
  isPinned: boolean;

  @Column({ type: 'datetime', nullable: true })
  pinnedAt: Date | null;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @ManyToMany(() => Vocabulary, (vocabulary) => vocabulary.categories)
  vocabularies: Vocabulary[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
