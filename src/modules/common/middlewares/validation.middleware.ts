import { Request, Response, NextFunction } from "express";
import {z, ZodError} from 'zod';
import { StatusCodes } from "http-status-codes";

export const validateSchema = (schema: z.ZodObject<any>) => (req: Request, res: Response, next: NextFunction) =>{
    try{
       schema.parse(req.body)
       next()
    }catch(error){
        if(error instanceof ZodError){
            const errorMessage = error.errors.map((issue: any) =>({
                message: `${issue.path.join('.')} is ${issue.message}`
            }))
            res.status(StatusCodes.BAD_REQUEST).json({error: "Invalid data", details: errorMessage})
        }else{
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: 'Internal Server Error'});
        }
    }
}