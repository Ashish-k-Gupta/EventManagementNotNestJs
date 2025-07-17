import { DataSource } from "typeorm";
import { SeederInterface } from "./seeder.interface";
import { SeederLog } from "./SeederLog.entity";

export class SeederService {
    constructor(private dataSource: DataSource, private seeders: SeederInterface[]) { }
    async runSeeders() {
        const logRepo = this.dataSource.getRepository(SeederLog);
        for (const seeder of this.seeders) {
            const existingSeeder = await logRepo.findOneBy({ seederName: seeder.name })
            if (existingSeeder) {
                console.log(`Skipping '${seeder.name}', already ran`)
            }

            const querRunner = this.dataSource.createQueryRunner();
            await querRunner.connect();
            await querRunner.startTransaction();

            try {
                await seeder.run(querRunner.manager);
                await querRunner.manager.getRepository(SeederLog).save({
                    seederName: seeder.name,
                    message: `${seeder.name} ran successfully.`,
                    createdAt: new Date()
                })
                console.log(`🌱 ${seeder.name} seeded successfully`);
                await querRunner.commitTransaction();
            } catch (error) {
                querRunner.rollbackTransaction()
                console.error(`❌ Seeder failed: ${seeder.name}`)
                console.error(error)
            } finally {
                await querRunner.release();
            }
        }
    }
}