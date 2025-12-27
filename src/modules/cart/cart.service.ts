import { DataSource, EntityManager, In, Repository } from "typeorm";
import { AddCartItem } from "./validator/cart.validator";
import { CartItem } from "./entity/CartItem.entity";
import { Cart } from "./entity/Cart.entity";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { BadRequestException } from "../common/errors/http.exceptions";
import { TicketService } from "../tickets/ticket.service";
import { Ticket } from "../tickets/models/Ticket.entity";

export class CartService {

    constructor(
        private dataSource: DataSource,
        private ticketService: TicketService
    ) { }

    async getCart(userId: string) {
        const cartRepo = this.dataSource.getRepository(Cart);
        const userCart = await cartRepo.findOne({
            where: {
                user: {
                    id: userId
                }
            },
            relations: ['items', 'items.eventSlot', 'items.eventSlot.event'],
            select: {
                items: {
                    id: true,
                    cart_id: true,
                    cart: true,
                    price_snapshot: true,
                    reserved_until: true,
                    event_slot_id: true,
                    eventSlot: {
                        id: true,
                        start_date: true,
                        is_cancelled: true,
                        is_sold_out: true,
                        ticket_price: true,
                        event: {
                            id: true,
                            title: true,
                            description: true,
                            isCancelled: true,
                            categories: true,
                            language: true,
                            venue: true,

                        }
                    }
                }
            }
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


            const eventSlot = await manager.getRepository(EventSlot)
                .createQueryBuilder("eventSlot")
                .setLock("pessimistic_write")
                .innerJoinAndSelect("eventSlot.event", "event")
                .where("eventSlot.id = :id", { id: eventSlotId })
                .getOne();

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
                relations: ['cart', 'cart.user', 'eventSlot'],

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
                    message: cartItem
                }
            } else {
                await eventSlotRepo.save(eventSlot);
                await cartItemRepo.remove(cartItem);

                return {
                    success: true,
                    message: cartItem
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
        const result = await this.dataSource.transaction(async (manager: EntityManager) => {
            const cartRepo = manager.getRepository(Cart);
            const cartItemRepo = manager.getRepository(CartItem);
            const evenSlotRepo = manager.getRepository(EventSlot);

            const userCart = await cartRepo.findOne({
                where: { user_id: userId },
                relations: ['items', 'items.eventSlot', 'items.eventSlot.event']
            });

            if (!userCart) {
                throw new BadRequestException('Something went wrong please try again');
            }

            let restartCheckout = false;
            const validItem: CartItem[] = [];

            for (const item of userCart.items) {
                const now = new Date();
                // Validation logic...
                if (item.reserved_until < now || item.eventSlot.is_cancelled || item.eventSlot.event.isCancelled) {
                    item.eventSlot.available_seats += item.quantity;
                    await evenSlotRepo.save(item.eventSlot);
                    await cartItemRepo.delete(item);
                    restartCheckout = true;
                    continue;
                }
                validItem.push(item);
            }

            if (restartCheckout) return { status: "RESTART_REQUIRED" };
            if (validItem.length === 0) return { status: "EMPTY_CART" };

            const tickets = await this.ticketService.issueTicketFromCart(userId, manager, validItem);
            await cartItemRepo.remove(validItem);

            return { status: 'SUCCESS', tickets };
        });

        if (result.status === 'SUCCESS' && result.tickets) {
            const ticketIds = result.tickets.map((t: any) => t.id);
            const fullTickets = await this.dataSource.getRepository(Ticket).find({
                where: { id: In(ticketIds) },
                relations: ['user', 'eventSlot', 'eventSlot.event']
            });

            this.ticketService.sendConfirmationEmails(fullTickets);
        }
        return result;
    }
}
