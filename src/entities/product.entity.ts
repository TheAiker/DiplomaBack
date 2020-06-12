import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { ImageEntity } from './image.entity';

@Entity()
export class ProductEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string;

    @Column()
    price!: number;

    @ManyToOne(_type => CategoryEntity)
    @JoinColumn()
    category!: CategoryEntity;

    @OneToOne(_type => ImageEntity)
    @JoinColumn()
    previewImage!: ImageEntity;

}
