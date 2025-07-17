import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import UserTracking from "../../common/models/UserTracking.entity";
import { Users } from "../../users/models/Users.entity";
import { Category } from "../../category/entity/Category.entity";
import { IsBoolean } from "class-validator";

@Entity()
export class Events extends UserTracking{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: false, unique: true})
    title!: string;

    @Column({nullable: true})
    description!: string;

    @Column({nullable: false})
    language!: string;

    @Column({default: 0})
    availableSeats!: number;

    @Column({nullable: false, type: 'decimal', precision: 10, scale: 2})
    ticketPrice!: number;

    @Column({type: 'timestamptz', nullable: false, name: "event_from_date"})
    startDate!: Date;

    @Column({type: 'timestamptz', nullable: false, name: "event_till_date"})
    endDate!: Date;

    @ManyToOne(() => Users, (users) => users.events)
    @JoinColumn({name: 'user_id'})
    user!: Users;

    @ManyToMany(() => Category, (category) => category.events)
    @JoinTable({
        name: 'event_categories',
        joinColumn: {
            name: 'event_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn:{
            name: 'category_id',
            referencedColumnName: 'id'
        }
    })
    categories!: Category[];

    @Column({nullable: false, default: false})
    @IsBoolean()
    isCancelled!: boolean;
}