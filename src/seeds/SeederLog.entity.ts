import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SeederLog {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    seederName!: string;

    @Column({ type: 'text' })
    message!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}