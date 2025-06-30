import { DataSource, In, Repository } from "typeorm";
import { Category } from "./entity/Category.entity";
import { CreateCategoryInput, UpdateCategoryInput } from "./validator/category.validator";
import { NotFoundException } from "../common/errors/http.exceptions";

export class CategoryService {
    private categoryRepository :  Repository<Category>;
    constructor(
        private dataSource : DataSource,
    ){
        this.categoryRepository = dataSource.getRepository(Category);
    }

    async createCategory(createCategoryInput : CreateCategoryInput): Promise<Category>{
        const newCategory = this.categoryRepository.create(createCategoryInput);

        return await this.categoryRepository.save(newCategory);
    }

    async findCategoryById(id: number): Promise<Category>{
        const category = await this.categoryRepository.findOne({where:{id}})
        if(!category){
            throw new NotFoundException(`Category with ID "${id}" not found`)
        }
        return category;
    }

    async findCategoryListByIds(ids: number[]): Promise<Category[]>{
        if(ids.length === 0){
            return [];
        }
        const categories = await this.categoryRepository.find({
            where: {id: In(ids)},
            select: ['id', 'name', 'created_by', 'updated_by','created_at', 'updated_at']
        })

        if(categories.length !== ids.length){
            const foundIds = new Set(categories.map(val => val.id));
            const missingIds = ids.filter(id =>  !foundIds.has(id));
            throw new NotFoundException(`One or more categories with ID(s) ${missingIds.join(', ')} do not exist.`);
        }
        return categories;
    }

    async findAllCategory():Promise<Category[]>{
        return await this.categoryRepository.find();
    }
    
    async quickList():Promise<Category[]>{
        return await this.categoryRepository.find({
            select: ['id', 'name']
        });
    }

    async updateCategory(id: number, updateCategoryInput : UpdateCategoryInput): Promise<Category>{
        const categoryToUpdate = await this.findCategoryById(id);
        if(updateCategoryInput.name !== undefined){
            categoryToUpdate.name = updateCategoryInput.name;
        }
        return await this.categoryRepository.save(categoryToUpdate);
    }

    async softRemoveCategory(categoryId: number): Promise<{message: string}>{
        const categoryToRemove  = await this.findCategoryById(categoryId);
        await this.categoryRepository.softRemove(categoryToRemove);
        return {message: `Category removed.`}
    }

}