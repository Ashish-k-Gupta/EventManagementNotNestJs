import { CategoryService } from "./category.service";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestException } from "../common/errors/http.exceptions";

export class CatergoryController{
    constructor(private categoryService: CategoryService){}

    createCategory = async(req: Request, res: Response, next: NextFunction) =>{
        try{
            const newCategory = await this.categoryService.createCategory(req.body)
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

findCategoryById = async(req: Request, res: Response, next: NextFunction) =>{
    try{
        const idsString = req.query.ids as string;
            if (!idsString) {
                throw new BadRequestException('Category IDs are required as a comma-separated list in query parameters (e.g., ?ids=1,2,3).');
            }
        const id = parseInt(req.params.ids, 10);
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
        throw parseId;
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
        await this.categoryService.softRemoveCategory(id)
        res.status(StatusCodes.NO_CONTENT).send()

    }catch(err){
        next(err)
    }
}

}