import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type VoiceGender = 'male' | 'female' | 'neutral';

@Entity('voices')
export class Voice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column()
  languageCode: string;

  @Column({ type: 'text', default: 'neutral' })
  gender: VoiceGender;

  @Column()
  provider: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
  isPreferred: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


