import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
dotenv.config();


export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10): undefined,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,

    synchronize: false,
    logging: process.env.NODE_ENV !== 'production' ? ['warn', 'migration', 'error']: false, 
    connectTimeoutMS: 10000,


    entities: [__dirname + "/**/*.entity.{ts,js}"],
    migrations: [__dirname + "/migration/*.ts"],
    // migrations: [__dirname + "./src/migration/*.{ts,js}"],
    subscribers: []

})

export async function createAndInitializeDataSource(): Promise<DataSource> {
    try{
        if(!AppDataSource.isInitialized){
           await AppDataSource.initialize();
            console.log("Data source has been initialized!");
        }else{
            console.log("Data source is already initialized.")
        }
        return AppDataSource;
    }catch(err){
        console.error("Error during Data Source initialization", err)
        process.exit(1);
    }
}