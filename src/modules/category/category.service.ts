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
        const categoryList = this.categoryRepository.find({
            where: {id: In(ids)}
        })
        return categoryList;
    }

    async findAllCategory():Promise<Category[]>{
        return await this.categoryRepository.find();
    }

    async updateCategory(id: number, updateCategoryInput : UpdateCategoryInput): Promise<Category>{
        const categoryToUpdate = await this.findCategoryById(id);
        if(updateCategoryInput.name !== undefined){
            categoryToUpdate.name = updateCategoryInput.name;
        }
        return await this.categoryRepository.save(categoryToUpdate);
    }

    async softRemoveCategory(categoryId: number): Promise<void>{
        const categoryToRemove  = await this.findCategoryById(categoryId);
        await this.categoryRepository.softRemove(categoryToRemove);
        return;
    }

}