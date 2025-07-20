import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTicketsTableAndRelations1752825327267 implements MigrationInterface {
    name = 'CreateTicketsTableAndRelations1752825327267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ticket" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "event_id" integer NOT NULL, "price" numeric(10,2) NOT NULL, "isCancelled" boolean NOT NULL DEFAULT false, "registered_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "totalSeats"`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_368610dc3312f9b91e9ace40354" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_902a22d2110174b48925314c875" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_902a22d2110174b48925314c875"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_368610dc3312f9b91e9ace40354"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "totalSeats" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`DROP TABLE "ticket"`);
    }

}
