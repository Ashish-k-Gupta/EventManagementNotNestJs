import { DataSource, EntityManager } from "typeorm";

export interface SeederInterface {
    name: string;
    run(dataSource: EntityManager): Promise<void>;
}