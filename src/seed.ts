

import { createAndInitializeDataSource } from "./AppDataSource";
import { SeederService } from "./seeds/seederService";
import { adminSeeder } from "./seeds/seeders/admin.seed";


async function run() {
    console.log("🚀 Starting database seeding process...");
    const dataSourceInstance  = await createAndInitializeDataSource();

    const seederService = new SeederService(dataSourceInstance , [
        new adminSeeder()
    ])
    await seederService.runSeeders();
    if(dataSourceInstance.isInitialized){
        await dataSourceInstance.destroy();
        console.log("🔌 Data Source connection closed."); 
    }else{
        console.warn("⚠️ Data Source was not initialized, skipping destroy.");
    }
    console.log("✅ Database seeding process completed successfully!");
}

run().catch((error) => {
    console.error(`❌ Failed to run seeder:`, error)
    process.exit(1)
});

