import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string;

}

