import { Router } from "express";
import { CatergoryController } from "../category.controller";

export const catergoryRouter =  {
    constructor(
        private categoryController: CatergoryController,
    ){}
}