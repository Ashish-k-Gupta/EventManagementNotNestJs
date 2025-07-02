import { response } from "express";
import { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";

export interface QueryOptions{
    page?: number;
    limit?: number;
    sort?: {[key: string]: 'ASC'|'DESC'};
    filters?: {[key: string]: any};
    search?: string;
    startDate?: string;
    endDate?: string;
}

export async function buildAndExecuteQuery<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: QueryOptions,
    customQueryBuilderCallBack?: (qb: SelectQueryBuilder<T>, filter: ObjectLiteral) => SelectQueryBuilder<T>
):Promise<{data: T[]; totalCount: number}>{
    const {page = 1, limit = 10, sort ={}, filters = {}, search, startDate, endDate} = options;
    const skip = (page - 1) * limit;

    let queryBuilder = repository.createQueryBuilder(repository.metadata.tableName)

    for(const key in filters){
        if(filters.hasOwnProperty(key) && filters[key] !== undefined){
            queryBuilder.andWhere(`${repository.metadata.tableName}.${key} = :${key}`,{[key]: filters[key]});
        }
    }

    if(search){
        queryBuilder.andWhere(
            `(${repository.metadata.tableName}.name ILIKE :search OR ${repository.metadata.tableName}.description ILIKE :search)`,
            {search: `%${search}%`}
        );
    }

    if(startDate || endDate){
        const dateColumn  = `${repository.metadata.tableName}.eventDate`;
        if(startDate){
            queryBuilder.andWhere(`${dateColumn} >= :startDate`, {startDate: new Date(startDate)});
        }
        if(endDate){
            if(endDate){
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999)
                queryBuilder.andWhere(`${dateColumn} <= :endDate`,{endDate: endOfDay});
            }            
        }
    }

    if(customQueryBuilderCallBack){
        queryBuilder = customQueryBuilderCallBack(queryBuilder, filters);
    }

    for(const key in sort){
        if(sort.hasOwnProperty(key)){
            queryBuilder.addOrderBy(`${repository.metadata.tableName}.${key}`, sort[key])
        }
    }

    queryBuilder.skip(skip).take(limit);

    const [data, totalCount] = await queryBuilder.getManyAndCount();
    return {data, totalCount};

}
    