import { DataSource} from "typeorm";
import { loadEntityFiles } from "./utils/load-entities";
import { loadMigrationFiles } from "./utils/load-migration";
import dotenv from 'dotenv'
dotenv.config();

export let AppDataSource: DataSource;

export async function createAndInitializeDataSource(): Promise<DataSource> {
try{
    const loadedEntities = await loadEntityFiles();
    const loadedMigrations = await loadMigrationFiles();
    const appDataSource = new DataSource({
        type: process.env.DB_TYPE as 'postgres',
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10): undefined,
        username: process.env.DB_USERNAME ,
        password: process.env.DB_PASSWORD, 
        synchronize: process.env.NODE_ENV !=='production' ? true : false,
        entities: loadedEntities,
        migrations: loadedMigrations,
        logging: process.env.NODE_ENV !== 'production' ? ['warn', 'migration', 'error'] : false,
        connectTimeoutMS: 10000,
    })
    await appDataSource.initialize();
    console.log("Data source has been initialized!");
    return appDataSource;
}
catch(err){
    console.log("Error during Data Source initialzation", err)
    process.exit(1);
}
}