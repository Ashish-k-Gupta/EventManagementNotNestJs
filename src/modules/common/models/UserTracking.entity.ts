import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { currentSession } from "../../../helper/sessions";

@Entity()
export default class UserTracking {
   @PrimaryGeneratedColumn()
   id!: string;

   @Column({ name: 'created_by', nullable: true, })
   created_by!: string;

   @Column({ name: 'updated_by', nullable: true })
   updated_by!: string;

   @Column({ name: 'deleted_by', nullable: true, default: null })
   deleted_by!: string;

   @CreateDateColumn({ type: 'timestamp', nullable: true, default: null })
   created_at!: Date;

   @UpdateDateColumn({ type: 'timestamp', nullable: true, default: null })
   updated_at!: Date;

   @DeleteDateColumn({ type: 'timestamp', nullable: true, default: null })
   deleted_at!: Date;

   @BeforeInsert()
   setCreatedBy() {
      const currentUser = currentSession.get('user');
      this.created_by = currentUser?.id;
   }

   @BeforeUpdate()
   setUpdatedBy() {
      const currentUser = currentSession.get('user');
      this.updated_by = currentUser?.id;
   }
}