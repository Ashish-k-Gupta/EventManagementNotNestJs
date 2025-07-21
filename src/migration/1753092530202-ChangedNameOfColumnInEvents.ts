import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedNameOfColumnInEvents1753092530202 implements MigrationInterface {
    name = 'ChangedNameOfColumnInEvents1753092530202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn("events", "event_from_date", "event_start_date");
        await queryRunner.renameColumn("events", "event_till_date", "event_end_date");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn("events", "event_end_date", "event_till_date");
        await queryRunner.renameColumn("events", "event_start_date", "event_from_date");
    }
}