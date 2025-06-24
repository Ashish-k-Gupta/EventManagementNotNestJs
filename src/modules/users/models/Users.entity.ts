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
    username!: string;

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


    // private _tempPassword: string | undefined;

    // public setPassword(newPassword: string){
    //     this._tempPassword = newPassword;
    //     this._tempPassword = undefined;
    // }

    // @BeforeInsert()
    // async HashBeforeInsert(){
    //     if(this._tempPassword){
    //         const salt = await bcrypt.genSalt(10)
    //         this.password = await bcrypt.hash(this._tempPassword, salt)
    //         this._tempPassword = undefined;
    //     }
    // }

    // @BeforeUpdate()
    // async HashBeforeUpdate(newPassword: string){
    //     if(this.password){
    //         const salt = await bcrypt.genSalt(10);
    //         this.password = await bcrypt.hash(newPassword, salt)
    //     }
    // }

    // public comparePassword(userPassword: string):Promise<boolean | null>{
    //     if(!userPassword){
    //         return Promise.resolve(false);
    //     }
    //     return bcrypt.compare(userPassword, this.password)
    // }
}