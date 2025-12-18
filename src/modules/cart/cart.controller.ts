import { NextFunction, Request, Response } from "express";
import { AddCartItem } from "./validator/cart.validator";
import { CartService } from "./cart.service";
import { BadRequestException } from "../common/errors/http.exceptions";


export class CartController {
    constructor(private cartService: CartService) { }

    getCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const cart = await this.cartService.getCart(userId);
            res.status(200).json({
                success: true,
                message: cart
            })
        }
        catch (error) {
            next(error);
        }
    }


    addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const itemDetails: AddCartItem = {
                eventSlotId: req.body.eventSlotId,
                numberOfTickets: req.body.numberOfTickets,
            }
            await this.cartService.addCartItem(userId, itemDetails);
            res.status(200).json({
                success: true,
                message: 'Item added to cart successfully'
            })
        } catch (error) {
            next(error);
        }
    }


    removeItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;
            const itemId = req.params.itemId;

            const result = await this.cartService.removeItemFromCart(userId, itemId);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }


    clearCart = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const userId = req.user!.id;
            await this.cartService.clearCart(userId);
            res.status(200).json({
                success: true,
                message: 'All items were successfully removed from the cart'
            })
        } catch (error) {
            next(error);
        }
    }

    checkoutCart = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const userId = req.user!.id;
            const result = await this.cartService.checkoutCart(userId);

            if (result.status === 'RESTART_REQUIRED') {
                return res.status(400).json({
                    success: false,
                    message: 'Some items in your cart were expired or cancelled. Your cart has been updated. Please review and try again.'
                });
            }

            if (result.status === 'EMPTY_CART') {
                return res.status(400).json({
                    success: false,
                    message: 'Your cart is empty.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Your tickets are booked, please check tickets on registered email',
                data: result.tickets
            });

        } catch (error) {
            next(error);
        }
    }
}