import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('background_categories')
export class BackgroundCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    value: string; // e.g., 'nature', 'city', 'christmas'

    @Column()
    label: string; // e.g., 'Thiên nhiên', 'Thành phố', 'Giáng sinh'

    @Column()
    icon: string; // e.g., '🌸', '🌆', '🎄'

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
