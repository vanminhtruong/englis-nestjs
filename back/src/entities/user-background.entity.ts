import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_backgrounds')
@Index('IDX_user_backgrounds_userId', ['userId'])
export class UserBackground {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @CreateDateColumn()
  createdAt: Date;
}
