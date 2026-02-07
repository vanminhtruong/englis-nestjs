import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Vocabulary } from './vocabulary.entity';

@Entity()
export class VocabularyTab {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: false })
    isDefault: boolean;

    @ManyToMany(() => Vocabulary, (vocabulary) => vocabulary.tabs)
    @JoinTable()
    vocabularies: Vocabulary[];
}
