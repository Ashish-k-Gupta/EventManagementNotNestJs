import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingTableForResetPasswordToken1753262036016 implements MigrationInterface {
    name = 'AddingTableForResetPasswordToken1753262036016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."password_reset_token_tokenstatus_enum" AS ENUM('isValid', 'used', 'expired', 'invalidated')`);
        await queryRunner.query(`CREATE TABLE "password_reset_token" ("id" SERIAL NOT NULL, "created_by" integer, "updated_by" integer, "deleted_by" integer, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "token" character varying NOT NULL, "tokenStatus" "public"."password_reset_token_tokenstatus_enum" NOT NULL DEFAULT 'isValid', "expiry_time" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "UQ_6c50e3a3bee2912c1153c63aa64" UNIQUE ("token"), CONSTRAINT "PK_838af121380dfe3a6330e04f5bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_a4e53583f7a8ab7d01cded46a41"`);
        await queryRunner.query(`DROP TABLE "password_reset_token"`);
        await queryRunner.query(`DROP TYPE "public"."password_reset_token_tokenstatus_enum"`);
    }

}
