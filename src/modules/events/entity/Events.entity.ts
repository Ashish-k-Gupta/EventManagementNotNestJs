import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import UserTracking from "../../common/models/UserTracking.entity";
import { Users } from "../../users/models/Users.entity";

@Entity()
export class Events extends UserTracking{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: false})
    name!: string;

    @Column({nullable: true})
    description!: string;

    @Column({nullable: false})
    language!: string;

    @Column({nullable: false})
    ticketPrice!: number;

    @Column({type: 'datetime', nullable: false, name: "event_from_date"})
    fromDate!: Date;

    @Column({type: 'datetime', nullable: false, name: "event_till_date"})
    tillDate!: Date;

    @Column({nullable: false, unique: true})
    category!: string;

    @ManyToOne(() => Users, (users) => users.events)
    @JoinColumn({name: 'user_id'})
    user!: Users;

}