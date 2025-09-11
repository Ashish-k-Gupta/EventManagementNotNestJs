import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1757443759755 implements MigrationInterface {
    name = 'InitialSchema1757443759755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ticket" ("id" SERIAL NOT NULL, "numberOfTickets" integer NOT NULL DEFAULT '1', "totalPrice" numeric(10,2) NOT NULL, "isCancelled" boolean NOT NULL DEFAULT false, "registered_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "event_slot_id" integer, CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_slot" ("id" SERIAL NOT NULL, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "total_seats" integer NOT NULL, "available_seats" integer NOT NULL, "ticket_price" numeric(10,2) NOT NULL, "is_sold_out" boolean NOT NULL DEFAULT false, "is_cancelled" boolean NOT NULL DEFAULT false, "event_id" integer, CONSTRAINT "PK_2fb2e127e2f9d6aa6bc162904a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "events" ("id" SERIAL NOT NULL, "created_by" integer, "updated_by" integer, "deleted_by" integer, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "description" character varying, "language" character varying NOT NULL, "isCancelled" boolean NOT NULL DEFAULT false, "user_id" integer, CONSTRAINT "UQ_bab6cf3a1e33e6790e9b9bd7d1d" UNIQUE ("title"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_categories" ("event_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_612fc92db0790503827c0b82af9" PRIMARY KEY ("event_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c78c7b670b392b79ee76f01b67" ON "event_categories" ("event_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_372a350b878524310e04d0ddec" ON "event_categories" ("category_id") `);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_368610dc3312f9b91e9ace40354" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_e90a94b9b5bf1f0a0f845af2afd" FOREIGN KEY ("event_slot_id") REFERENCES "event_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_slot" ADD CONSTRAINT "FK_d8b47b63401a4330f384764f955" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_09f256fb7f9a05f0ed9927f406b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_categories" ADD CONSTRAINT "FK_c78c7b670b392b79ee76f01b675" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "event_categories" ADD CONSTRAINT "FK_372a350b878524310e04d0ddec2" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_categories" DROP CONSTRAINT "FK_372a350b878524310e04d0ddec2"`);
        await queryRunner.query(`ALTER TABLE "event_categories" DROP CONSTRAINT "FK_c78c7b670b392b79ee76f01b675"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_09f256fb7f9a05f0ed9927f406b"`);
        await queryRunner.query(`ALTER TABLE "event_slot" DROP CONSTRAINT "FK_d8b47b63401a4330f384764f955"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_e90a94b9b5bf1f0a0f845af2afd"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_368610dc3312f9b91e9ace40354"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_372a350b878524310e04d0ddec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c78c7b670b392b79ee76f01b67"`);
        await queryRunner.query(`DROP TABLE "event_categories"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "event_slot"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
    }

}
