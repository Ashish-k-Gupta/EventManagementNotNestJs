import { DataSource, Repository } from "typeorm";
import { AddCartItem } from "./validator/cart.validator";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { CartItem } from "./entity/CartItem.entity";
import { Cart } from "./entity/Cart.entity";

export class CartService {
    constructor(
        private dataSource: DataSource
    ) { }

    async addCartItem(userId: string, itemDetails: AddCartItem) {
        const { eventSlotId, numberOfTickets } = itemDetails;

        return this.dataSource.transaction(async (manager) => {
            const evetSlotRepo = manager.getRepository(EventSlot);
            const cartItemRepo = manager.getRepository(CartItem);
            const cartRepo = manager.getRepository(Cart);

            const eventSlot = await evetSlotRepo.findOne({
                where: { id: eventSlotId },
                relations: ['events']
            })

            if (!eventSlot) throw new Error('Slot not found!')
            if (eventSlot.event.isCancelled) throw new Error('Event is cancelled');
            if (eventSlot.is_cancelled) throw new Error('Slot is cancelled');
            if (eventSlot.is_sold_out) throw new Error('Slot is sold out')

            const now = new Date();
            if (eventSlot.start_date < now) throw new Error('Event has already started');

            if (eventSlot.available_seats < numberOfTickets) throw new Error('Insufficient Sets')

            let cart = await cartRepo.findOne({ where: { user_id: userId } })

            if (!cart) {
                cart = cartRepo.create({
                    user_id: userId
                })
                cart = await cartRepo.save(cart)
            }

            let exisitingCartItem = await cartItemRepo.findOne({
                where: {
                    cart: {
                        id: cart.id
                    },
                    eventSlot: { id: eventSlot.id }
                }
            })

            if (exisitingCartItem) {
                exisitingCartItem.quantity += numberOfTickets;
                await cartItemRepo.save(exisitingCartItem);
            } else {
                const newCartItem = cartItemRepo.create({
                    eventSlot: eventSlot,
                    cart: cart,
                    quantity: numberOfTickets,
                    price_snapshot: eventSlot.ticket_price,
                    reserved_until: new Date(Date.now() + 15 * 60 * 1000)
                })

                await cartItemRepo.save(newCartItem);
            }
            eventSlot.available_seats -= numberOfTickets;
            await evetSlotRepo.save(eventSlot);


        })

    }


    async removeItemFromCart(userId: string, itemId: string) {
        if (!userId || !itemId) {
            throw new Error('Invalid Input: userId and ItemId are required');
        }

        return this.dataSource.transaction(async (manager) => {
            const cartItemRepo = manager.getRepository(CartItem);
            const eventSlotRepo = manager.getRepository(EventSlot);
            const cartItem = await cartItemRepo.findOne({
                where: {
                    id: itemId,
                    cart: {
                        user_id: userId
                    }
                }
            })
            if (!cartItem) throw new Error('Cart item not found or unauthorized');
            if (cartItem.cart.user_id !== userId) throw new Error('Unauthoized error')

            const eventSlot = cartItem.eventSlot;

            if (cartItem.quantity > 0) {
                cartItem.quantity -= 1;
                eventSlot.available_seats += 1;
                await eventSlotRepo.save(eventSlot);
                await cartItemRepo.save(cartItem);
                return {
                    success: true,
                    message: 'Item is removed'
                }
            } else {
                await cartItemRepo.remove(cartItem);
                await eventSlotRepo.save(eventSlot);

                return {
                    success: true,
                    message: 'Item fully remove from cart.'
                }
            }



        })

    }

}





