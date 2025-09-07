import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Events } from "./Events.entity";
import { Ticket } from "../../tickets/models/Ticket.entity";

@Entity()
export class Event_slot {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'timestamp' })
    start_date!: string

    @Column({ type: 'timestamp' })
    end_date!: string;

    @Column({ type: 'integer' })
    total_seats!: number;

    @Column({ type: 'integer' })
    available_seats!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    ticket_price!: number;

    @Column({ type: 'boolean', default: false })
    is_sold_out!: false;

    @Column({ type: 'boolean', default: false })
    is_cancelled!: boolean;

    @ManyToOne(() => Events, (event) => event.slots)
    event!: Event;

    @OneToMany(() => Ticket, (tickets) => tickets.event)
    tickets!: Ticket[];
}