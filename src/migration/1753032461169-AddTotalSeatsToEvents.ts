import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalSeatsToEvents1753032461169 implements MigrationInterface {
    name = 'AddTotalSeatsToEvents1753032461169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" RENAME COLUMN "price" TO "totalPrice"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "totalSeats" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "totalSeats"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME COLUMN "totalPrice" TO "price"`);
    }

}
