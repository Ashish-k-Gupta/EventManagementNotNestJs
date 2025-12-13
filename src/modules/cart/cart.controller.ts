import { NextFunction, Request, Response } from "express";
import { AddCartItem } from "./validator/cart.validator";
import { CartService } from "./cart.service";
import { error } from "node:console";


export class CartController {
    constructor(private cartService: CartService) { }

    getCart = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const cart = await this.cartService.getCart(userId);
        res.status(200).json({
            success: true,
            message: cart
        })
    }

    getCartItem = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const cartItems = await this.cartService.getCartDetails(userId)
        res.status(200).json({
            success: true,
            message: 'Success'
        })
    }


    addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body);
        const userId = req.user!.id;
        const itemDetails: AddCartItem = {
            eventSlotId: req.body.eventSlotId,
            numberOfTickets: req.body.numberOfTickets,
        }
        console.log('FROM CONTROLLER', itemDetails.eventSlotId, itemDetails.numberOfTickets)

        await this.cartService.addCartItem(userId, itemDetails);
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully'
        })
    }


    removeItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.user, req.body)
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
        const total = await this.cartService.getCartDetails(userId)
        res.status(200).json({
            success: true,
            message: total
        })
    }

    clearCart = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        await this.cartService.clearCart(userId);
        res.status(200).json({
            success: true,
            message: 'All items were successfully removed from the cart'
        })
    }

}