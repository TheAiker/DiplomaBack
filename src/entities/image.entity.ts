import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('images')
export class ImageEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    hash!: string;

}
