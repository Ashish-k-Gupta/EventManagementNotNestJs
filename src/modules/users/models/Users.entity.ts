import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import UserTracking from "../../common/models/UserTracking.entity";
import { Events } from "../../events/entity/Events.entity";

import { UserRolesArray } from "../enums/UserRole.enum";
import { Ticket } from "../../tickets/models/Ticket.entity";
import { PasswordResetToken } from "./PasswordResetToken.entity";
import { Cart } from "../../cart/entity/Cart.entity";

@Entity()
export class Users extends UserTracking {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ nullable: false })
    firstName!: string;

    @Column({ nullable: false })
    lastName!: string;

    @Column({ nullable: false, unique: true })
    email!: string;

    @Column({ nullable: false, length: 100, select: false })
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRolesArray,
        default: 'attendee'
    })
    role!: typeof UserRolesArray[number];

    @OneToMany(() => Events, (events) => events.user)
    events?: Events[];


    @OneToOne(() => Cart, cart => cart.user)
    cart!: Cart;

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    tickets!: Ticket[];


    @OneToMany(() => PasswordResetToken, (passwordResetToken) => passwordResetToken.user)
    resetTokens!: PasswordResetToken[];
}