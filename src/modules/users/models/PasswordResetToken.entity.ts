import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import UserTracking from "../../common/models/UserTracking.entity";
import { RESET_TOKEN_STATUS, ResetTokenStatusArray } from "../enums/ResetTokenStatus.enum";
import { Users } from "./Users.entity";


@Entity()
export class PasswordResetToken extends UserTracking{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true, nullable: false})
    token!: string;

    @Column({type: 'enum', nullable: false, enum: ResetTokenStatusArray, default: RESET_TOKEN_STATUS.IS_VALID})
    tokenStatus!: typeof ResetTokenStatusArray[number];

    @ManyToOne(() => Users, (users) => users.resetTokens)
    user!: Users;

    @Column({type: 'timestamp', nullable: false})
    expiry_time!: Date;

}   