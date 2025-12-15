import { DataSource, EntityManager, Repository } from "typeorm";
import { AddCartItem } from "./validator/cart.validator";
import { CartItem } from "./entity/CartItem.entity";
import { Cart } from "./entity/Cart.entity";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { BadRequestException } from "../common/errors/http.exceptions";

export class CartService {

    constructor(
        private dataSource: DataSource
    ) { }

    async getCart(userId: string) {
        const cartRepo = this.dataSource.getRepository(Cart);
        const userCart = await cartRepo.findOne({
            where: {
                user: {
                    id: userId
                }
            },
            relations: ['items']
        })

        if (!userCart) {
            const newUserCart = cartRepo.create({
                user_id: userId
            })
            await cartRepo.save(newUserCart);
        }

        let cartTotal = 0;
        if (userCart?.items.length === 0) {
            return cartTotal = 0;
        }
        for (const item of userCart!.items) {
            cartTotal = (item.price_snapshot * item.quantity)
        }


        return { userCart, cartTotal };
    }


    async addCartItem(userId: string, itemDetails: AddCartItem) {
        const { eventSlotId, numberOfTickets } = itemDetails;

        return this.dataSource.transaction(async (manager) => {
            const eventSlotRepo = manager.getRepository(EventSlot);
            const cartItemRepo = manager.getRepository(CartItem);
            const cartRepo = manager.getRepository(Cart);


            const eventSlot = await eventSlotRepo.findOne({
                where: { id: eventSlotId.toString() },
                relations: ['event'],
                lock: { mode: 'pessimistic_write' }
            });

            if (!eventSlot) throw new Error('Slot not found!');
            if (eventSlot.event.isCancelled) throw new Error('Event is cancelled');
            if (eventSlot.is_cancelled) throw new Error('Slot is cancelled');
            if (eventSlot.is_sold_out) throw new Error('Slot is sold out');

            if (eventSlot.start_date < new Date()) {
                throw new Error('Event has already started');
            }

            if (eventSlot.available_seats < numberOfTickets) {
                throw new Error('Insufficient seats');
            }

            let cart = await cartRepo.findOne({ where: { user_id: userId } });

            if (!cart) {
                cart = await cartRepo.save(cartRepo.create({ user_id: userId }));
            }

            const existingCartItem = await cartItemRepo.findOne({
                where: {
                    cart: { id: cart.id },
                    eventSlot: { id: eventSlot.id }
                }
            });

            if (existingCartItem) {
                existingCartItem.quantity += numberOfTickets;
                await cartItemRepo.save(existingCartItem);
            } else {
                await cartItemRepo.save(
                    cartItemRepo.create({
                        cart,
                        eventSlot,
                        quantity: numberOfTickets,
                        price_snapshot: eventSlot.ticket_price,
                        reserved_until: new Date(Date.now() + 15 * 60 * 1000),
                    })
                );
            }

            eventSlot.available_seats -= numberOfTickets;
            await eventSlotRepo.save(eventSlot);
        });
    }

    async removeItemFromCart(userId: string, itemId: string) {
        return this.dataSource.transaction(async (manager) => {
            const cartItemRepo = manager.getRepository(CartItem);
            const eventSlotRepo = manager.getRepository(EventSlot);
            const cartItem = await cartItemRepo.findOne({
                where: {
                    id: itemId,
                    cart: {
                        user_id: userId
                    }
                },
                relations: ['cart', 'cart.user', 'eventSlot']
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


    async clearCart(userId: string): Promise<void> {
        this.dataSource.transaction(async (manager) => {
            const CartRepo = manager.getRepository(Cart);
            const CartItemRepo = manager.getRepository(CartItem);
            const EventSlotRepo = manager.getRepository(EventSlot);

            const userCart = await CartRepo.findOne(
                {
                    where: { id: userId },
                    relations: ['items', 'items.eventSlot'],
                    select: {
                        id: true,
                        user: {
                            id: true,
                        },
                        items: {
                            id: true,
                            quantity: true,
                            eventSlot: {
                                id: true,
                                available_seats: true
                            }
                        }
                    }
                })
            if (!userCart || userCart.items.length === 0) {
                throw new Error('Cart is already empty')
            }
            const seatsToReleaseMap = new Map<string, number>();
            for (const item of userCart.items) {
                const slotId = item.eventSlot.id;
                const totalQuantity = item.quantity;
                const currentTotalSeats = seatsToReleaseMap.get(slotId) || 0;
                seatsToReleaseMap.set(slotId, currentTotalSeats + totalQuantity);
            }

            for (const [slotId, totalSeats] of seatsToReleaseMap.entries()) {
                const eventSlot = userCart.items.find(i => i.id)?.eventSlot;
                if (eventSlot) {
                    eventSlot.available_seats += totalSeats;
                    EventSlotRepo.save(eventSlot);
                }
            }

            CartItemRepo.createQueryBuilder()
                .delete()
                .from(CartItem)
                .where("cart_id = :cartId", { cartId: userCart.id })
                .execute()

            await CartRepo.save(userCart);
            return;
        })
    }
    async checkoutCart(userId: string) {
        return this.dataSource.transaction(async (manger: EntityManager) => {
            const cartRepo = manger.getRepository(Cart);
            const cartItemRepo = manger.getRepository(CartItem);
            const evenSlotRepo = manger.getRepository(EventSlot)

            const userCart = await cartRepo.findOne({
                where: {
                    user_id: userId
                },
                relations: ['items', 'items.eventSlot', 'items.eventSlot.event']
            })

            if (!userCart) {
                throw new BadRequestException('Something went wrong please try again')
            }

            let restartCheckout = false;
            const cartItems = [];
            for (const item of userCart.items) {
                const now = new Date();
                if (item.reserved_until < now) {
                    throw new Error('Session expired please review you cart again');
                }
                if (item.eventSlot.is_cancelled) {
                    item.eventSlot.available_seats += item.quantity;
                    await evenSlotRepo.save(item);
                    await cartItemRepo.delete(item);
                    throw new Error(`${item.eventSlot.event.title}'s slot is cancelled`)
                }
                if (item.eventSlot.event.isCancelled) {
                    item.eventSlot.available_seats += item.quantity;
                    await evenSlotRepo.save(item);
                    await cartItemRepo.delete(item);
                    throw new Error(`${item.eventSlot.event.title} is cancelled.`)
                }



            }

        })
    }
}
