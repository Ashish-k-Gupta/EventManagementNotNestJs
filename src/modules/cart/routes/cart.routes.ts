import { Router } from "express";
import { CartController } from "../cart.controller";

export const cartRouter = (cartController: CartController): Router => {
    const router = Router();

    router.get('/', cartController.getCart);

    router.post('/items', cartController.addItemToCart);
    router.delete('/items/:itemId', cartController.removeItemFromCart);
    router.delete('/clear', cartController.clearCart);

    router.post('/checkout', cartController.checkoutCart);

    return router;
}