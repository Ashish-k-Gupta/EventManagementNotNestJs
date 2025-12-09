import { NextFunction, Request, Response } from "express";
import { AddCartItem } from "./validator/cart.validator";
import { CartService } from "./cart.service";

interface AddCartItemDetails {
    itemId: string,
    numberOfItems: number,
}
export class CartController {
    constructor(private cartService: CartService) { }

    getCartItem = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const cartItems = await this.cartService.getCartItems(userId)
        res.status(200).json({
            success: true,
            message: ''
        })
    }


    addItemToCart = async (req: Request<{}, {}, AddCartItemDetails>, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const itemDetails: AddCartItem = {
            eventSlotId: req.body.itemId,
            numberOfTickets: req.body.numberOfItems,
        }

        await this.cartService.addCartItem(userId, itemDetails);
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully'
        })
    }


    removeItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const itemId = req.body.itemId;

        await this.cartService.removeItemFromCart(userId, itemId);
        res.status(200).json({
            success: true,
            message: 'Item remove from cart successfully'
        })
    }

    getCartTotal = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const total = await this.cartService.getCartTotal(userId)
        res.status(200).json({
            success: true,
            message: total
        })
    }
}