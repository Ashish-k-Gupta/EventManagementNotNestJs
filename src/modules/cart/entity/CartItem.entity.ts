import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./Cart.entity";
import { EventSlot } from "../../events/entity/EventSlot.entity";

@Entity()

export class CartItem {
    @PrimaryGeneratedColumn('uuid') // as it's just a side project, I'm using a uuid to generate PK because I can so I would.
    id!: string;

    @ManyToOne(() => Cart, cart => cart.items)
    @JoinColumn({ name: 'cart_id' })
    cart!: Cart;

    @Column({ name: 'cart_id' })
    cart_id!: string;

    @ManyToOne(() => EventSlot, eventSlot => eventSlot.cart_items)
    @JoinColumn({ name: 'event_slot_id' })
    eventSlot!: EventSlot;

    @Column({ name: 'event_slot_id' })
    event_slot_id!: string;

    @Column({ type: 'int', default: 1 })
    quantity!: number;

    @Column({ type: 'timestamp' })
    reserved_until!: Date;

    @Column({ type: 'numeric' })
    price_snapshot!: number;
}