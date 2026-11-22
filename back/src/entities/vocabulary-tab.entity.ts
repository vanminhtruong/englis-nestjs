import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Vocabulary } from './vocabulary.entity';

@Entity()
@Index('IDX_vocabulary_tab_userId', ['userId'])
export class VocabularyTab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Never derive ownership from client-supplied data.
  // Nullable only to allow a safe migration of legacy global tabs.
  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ default: false })
  isDefault: boolean;

  // Per-account display order. Legacy tabs start at zero and keep their current relative order.
  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @ManyToMany(() => Vocabulary, (vocabulary) => vocabulary.tabs)
  @JoinTable()
  vocabularies: Vocabulary[];
}
