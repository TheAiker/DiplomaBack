import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ImageEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    hash!: string;

}
