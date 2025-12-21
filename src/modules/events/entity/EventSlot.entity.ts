import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Events } from "./Events.entity";
import { Ticket } from "../../tickets/models/Ticket.entity";
import UserTracking from "../../common/models/UserTracking.entity";
import { CartItem } from "../../cart/entity/CartItem.entity";

@Entity()
export class EventSlot extends UserTracking {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ type: 'timestamp' })
    start_date!: Date;

    @Column({ type: 'timestamp', nullable: true })
    end_date!: Date;

    @Column({ type: 'integer' })
    total_seats!: number;

    @Column({ type: 'integer' })
    available_seats!: number;

    @ManyToOne(() => Events, (event) => event.slots)
    @JoinColumn({ name: 'event_id' })
    event!: Events;

    @OneToMany(() => Ticket, (ticket) => ticket.eventSlot)
    ticket!: Ticket[];

    @OneToMany(() => CartItem, cartItem => cartItem.eventSlot)
    cart_items!: CartItem[];


    @Column({ type: 'decimal', precision: 10, scale: 2 })
    ticket_price!: number;

    @Column({ type: 'boolean', default: false })
    is_sold_out!: boolean;

    @Column({ type: 'boolean', default: false })
    is_cancelled!: boolean;
}

