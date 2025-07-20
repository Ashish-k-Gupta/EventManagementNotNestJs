import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalSeatsToEvent1752815560903 implements MigrationInterface {
    name = 'AddTotalSeatsToEvent1752815560903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "totalSeats" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "totalSeats"`);
    }

}
