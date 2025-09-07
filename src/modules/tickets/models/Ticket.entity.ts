import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../../users/models/Users.entity";
import { Events } from "../../events/entity/Events.entity";
import { Event_slot } from "../../events/entity/EventSlot.entity";

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Users, user => user.tickets)
    @JoinColumn({ name: 'user_id' })
    user!: Users;

    @Column({ name: 'user_id' })
    userId!: number;

    @ManyToOne(() => Event_slot, eventSlot => eventSlot.tickets)
    @JoinColumn({ name: 'event_slot_id' })
    event!: Event_slot;

    @Column({ name: 'event_slot_id' })
    eventSlotId!: number;

    @Column({ type: 'int', default: 1, nullable: false })
    numberOfTickets!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    totalPrice!: number;

    @Column({ type: 'boolean', default: false, nullable: false })
    isCancelled!: boolean;

    @CreateDateColumn({ name: 'registered_at' })
    registeredAt!: Date;

}