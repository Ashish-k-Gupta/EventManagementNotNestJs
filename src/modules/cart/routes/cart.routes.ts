import { Router } from "express";
import { CartController } from "../cart.controller";

export const cartRouter = (cartController: CartController): Router => {
    const router = Router();
    router.get('/', cartController.getCart)
    router.post('/addItem', cartController.addItemToCart)
    router.post('/remove-item', cartController.removeItemFromCart)
    router.post('/clear-cart', cartController.clearCart)
    router.delete('/remove', cartController.removeItemFromCart)
    return router;
}