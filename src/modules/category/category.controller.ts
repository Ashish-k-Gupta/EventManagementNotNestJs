import { CategoryService } from "./category.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestException } from "../common/errors/http.exceptions";
import { CreateCategoryInput } from "./validator/category.validator";
import { AuthenticatedRequest } from "../../types/authenticated-request";

export class CatergoryController{
    constructor(private categoryService: CategoryService){}

    createCategory = async(req: AuthenticatedRequest, res: Response, next: NextFunction) =>{
        try{
            const userId = req.user.id;
            const createCategoryInput : CreateCategoryInput = {name: req.body.name}
            const newCategory = await this.categoryService.createCategory(userId, createCategoryInput)
            res.status(StatusCodes.CREATED).json(newCategory)
        }catch(err){
            next(err)
        }
    }

findAllCategory = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const allCategory = await this.categoryService.findAllCategory()
        res.status(StatusCodes.OK).json(allCategory)
    }catch(err){
        next(err)
    }
}
quickList =  async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const allCategory = await this.categoryService.quickList()
        res.status(StatusCodes.OK).json(allCategory)
    }catch(err){
        next(err)
    }
}

findCategoryById = async(req: Request, res: Response, next: NextFunction) =>{
    try{
       const id = parseInt(req.params.id, 10);
            if (!id) {
                throw new BadRequestException(`Invlid category IDs ${id}.`);
            }
        const category =await this.categoryService.findCategoryById(id);
        res.status(StatusCodes.OK).json(category);

    }catch(err){
        next(err)
    }
}

findCategoryListByIds = async(req: Request, res: Response, next: NextFunction) =>{
    try{
        const idsQueryParam = req.query.ids as string;
        if(!idsQueryParam){
            throw new BadRequestException('Category IDs are required as a comma-separated list in query parameters (e.g., ?ids=1,2,3).');
        }
       const ids : number[] = idsQueryParam.split(',').map(idStr => {
        const parseId = parseInt(idStr.trim(), 10);

        if(isNaN(parseId)){
            throw new BadRequestException('')
        }
        return parseId;
       })

        const categoryList =await this.categoryService.findCategoryListByIds(ids);
        res.status(StatusCodes.OK).json(categoryList);

    }catch(err){
        next(err)
    }
}

updateCategory = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const categoryId = parseInt(req.params.id, 10);
        const updatedCategory = await this.categoryService.updateCategory(categoryId, req.body)
        res.status(StatusCodes.OK).json(updatedCategory);
    }catch(err){
        next(err);
    }
}

softRemove = async (req: Request, res: Response, next: NextFunction) =>{
    try{
        const id = parseInt(req.params.id, 10);
        const removeCategory = await this.categoryService.softRemoveCategory(id);
        res.status(StatusCodes.OK).json(removeCategory);

    }catch(err){
        next(err)
    }
}

}