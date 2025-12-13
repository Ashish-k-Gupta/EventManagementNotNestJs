import { Router } from "express";
import { CartController } from "../cart.controller";

export const cartRouter = (cartController: CartController): Router => {
    const router = Router();
    router.get('/', cartController.getCartItem)
    router.get('/', cartController.getCartTotal)
    router.post('/addItem', cartController.addItemToCart)
    router.post('/remove-item', cartController.removeItemFromCart)
    router.post('/clear-cart', cartController.clearCart)
    return router;
}