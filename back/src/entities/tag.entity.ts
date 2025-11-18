import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { User } from './user.entity'

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  color: string

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User

  @Column()
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
