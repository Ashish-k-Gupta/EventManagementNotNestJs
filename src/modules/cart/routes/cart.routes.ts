import { Router } from "express";
import { CartController } from "../cart.controller";

export const cartRouter = (cartController: CartController): Router => {
    const router = Router();
    // router.get('/', cartController.)
    router.post('/addItem', cartController.addItemToCart)
    router.post('/remove-item', cartController.removeItemFromCart)

        return router;
}