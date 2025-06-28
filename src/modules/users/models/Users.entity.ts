import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import UserTracking from "../../common/models/UserTracking.entity";
import { UserRoles } from "../enums/UserRole.enum";
import { Events } from "../../events/entity/Events.entity";
import * as bcrypt from 'bcrypt'

import { UserRolesArray } from "../enums/UserRole.enum";

@Entity()
export class Users extends UserTracking{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: false, unique: true})
    firstName!: string;
    
    @Column({nullable: false, unique: true})
    lastName!: string;

    @Column({nullable: false, unique: true})
    email!: string;    

    @Column({nullable: false, length: 100, select: false})
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRolesArray,
        default: 'attendee'
        })
    role!: typeof UserRolesArray[number];

    @OneToMany(() => Events, (events) => events.user)
    events?: Events[];

}