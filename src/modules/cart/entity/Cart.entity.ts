import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../../users/models/Users.entity";
import { CartItem } from "./CartItem.entity";


@Entity()
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => Users, user => user.cart)
    @JoinColumn({ name: 'user_id' })
    user!: Users;

    @Column({ name: 'user_id' })
    user_id!: string;

    @OneToMany(() => CartItem, cartItem => cartItem.cart)
    items!: CartItem[];

}