import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailableSeatsToEvent1752777239915 implements MigrationInterface {
    name = 'AddAvailableSeatsToEvent1752777239915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "availableSeats" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "availableSeats"`);
    }

}
