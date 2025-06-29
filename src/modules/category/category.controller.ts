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

findCategoryById = async(req: Request, res: Response, next: NextFunction) =>{
    try{
        const idsString = req.query.ids as string;
            if (!idsString) {
                throw new BadRequestException('Category IDs are required as a comma-separated list in query parameters (e.g., ?ids=1,2,3).');
            }
        const id = parseInt(req.params.ids, 10);
        const category = this.categoryService.findCategoryById(id);
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
        const ids :number[] = idsQueryParam.split(',').map(idStr => {
            const parseId = parseInt(idStr.trim(), 10);

            if(isNaN(parseId)){
                throw new BadRequestException(`Invalid ID found in list: "${idStr}". All IDs must be valid numbers.`)
            }
            return parseId;
        });

        const categoryList = this.categoryService.findCategoryListByIds(ids);
        res.status(StatusCodes.OK).json(categoryList);

    }catch(err){
        next(err)
    }
}

}