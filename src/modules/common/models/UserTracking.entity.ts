import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { currentSession } from "../../../helper/sessions";

@Entity()
export default class UserTracking{
 @PrimaryGeneratedColumn()
 id!: number;

 @Column({type: 'integer', name: 'created_by', nullable: true, select: false})
 created_by!: number;

 @Column({type: 'integer', name: 'updated_by', nullable: true})
 updated_by!: number;

 @Column({type: 'integer', name: 'deleted_by', nullable: true, default: null})
 deleted_by!: number;

 @CreateDateColumn({type: 'timestamp', nullable: true, default: null})
 created_at!: Date; 

 @UpdateDateColumn({type: 'timestamp', nullable: true, default: null})
 updated_at!: Date;

 @DeleteDateColumn({type: 'timestamp', nullable: true, default: null})
 deleted_at!: Date;

 @BeforeInsert()
 setCreatedBy(){
    const currentUser = currentSession.get('user');
    this.created_by =currentUser?.id;
 }

 @BeforeUpdate()
 setUpdatedBy(){
    const currentUser = currentSession.get('user');
    this.updated_by = currentUser?.id;
 }
}