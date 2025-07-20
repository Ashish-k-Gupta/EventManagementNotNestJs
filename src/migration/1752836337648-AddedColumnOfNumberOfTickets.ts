import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnOfNumberOfTickets1752836337648 implements MigrationInterface {
    name = 'AddedColumnOfNumberOfTickets1752836337648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" ADD "numberOfTickets" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "numberOfTickets"`);
    }

}
