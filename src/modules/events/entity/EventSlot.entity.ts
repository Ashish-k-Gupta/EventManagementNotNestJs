import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Events } from "./Events.entity";
import { Ticket } from "../../tickets/models/Ticket.entity";

@Entity()
export class EventSlot {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'timestamp' })
    start_date!: string;

    @Column({ type: 'timestamp' })
    end_date!: string;

    @Column({ type: 'integer' })
    total_seats!: number;

    @Column({ type: 'integer' })
    available_seats!: number;

    @ManyToOne(() => Events, (event) => event.slots)
    @JoinColumn({ name: 'event_id' })
    event!: Events;

    @OneToMany(() => Ticket, (ticket) => ticket.event)
    ticket!: Ticket[];

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    ticket_price!: number;

    @Column({ type: 'boolean', default: false })
    is_sold_out!: boolean;

    @Column({ type: 'boolean', default: false })
    is_cancelled!: boolean;
}