import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    tittle: string;

    @Column('numeric', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true,
        nullable: true
    })
    slug: string;

    @Column('int', {
        nullable: true
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;


    //tags
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];



    //images
    @OneToMany(
        () => ProductImage,
        (ProductImage) => ProductImage.product,
        { cascade: true }
    )
    images?: ProductImage[];


    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.tittle
        }
        this.slug = this.tittle
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }
}