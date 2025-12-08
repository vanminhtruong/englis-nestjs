import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('category_date_topics')
export class CategoryDateTopic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    date: string; // YYYY-MM-DD

    @Column()
    topic: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ nullable: true })
    color: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
