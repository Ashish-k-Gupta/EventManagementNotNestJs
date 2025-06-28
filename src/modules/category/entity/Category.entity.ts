import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import UserTracking from "../../common/models/UserTracking.entity";
import { Events } from "../../events/entity/Events.entity";

@Entity()
export class Category extends UserTracking{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: false, unique: true})
    name!:string;

    @ManyToMany(() => Events, (event) => event.categories)
    events!: Event[];
}