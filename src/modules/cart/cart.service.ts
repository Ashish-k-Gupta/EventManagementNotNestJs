import { DataSource, Repository } from "typeorm";
import { EventSlot } from "../events/entity/EventSlot.entity";
import { CartItem } from "./entity/CartItem.entity";
import { Cart } from "./entity/Cart.entity";
import { AddCartItem } from "./validator/cart.validator";
import { NotFoundException } from "../common/errors/http.exceptions";

export class CartService {
    eventSlotRepository: Repository<EventSlot>;
    cartRepository: Repository<Cart>;
    cartItemRepository: Repository<CartItem>;
    constructor(private dataSource: DataSource) {
        this.eventSlotRepository = dataSource.getRepository(EventSlot);
        this.cartRepository = dataSource.getRepository(Cart);
        this.cartItemRepository = dataSource.getRepository(CartItem);
    }


    async addItemToCart(userId: string, itemData: AddCartItem) {
        try {

            const { eventSlotId, numberOfTickets } = itemData;

            const event = await this.eventSlotRepository.findOne(
                {
                    where: { id: eventSlotId },
                    relations: ['eventSlots']
                },
            )
            if (!event) {
                throw new NotFoundException('Event slot not found')
            }

            if (event.available_seats < numberOfTickets) {
                const availableSeats = numberOfTickets - event.available_seats;
                throw new Error(`Only ${availableSeats} are available`)
            }

            return await this.dataSource.transaction(
                async (manager) => {
                    const cartRepo = manager.getRepository(Cart);
                    const cartItemRepo = manager.getRepository(CartItem)
                    const eventSlotRepo = manager.getRepository(EventSlot);

                    const eventSlot = await eventSlotRepo.findOne({
                        where: {
                            id: eventSlotId
                        },
                        relations: ['event']
                    })

                    if (!eventSlot) {
                        throw new NotFoundException('Event is not found!')
                    }

                    if (eventSlot.is_cancelled) {
                        throw new Error('This slot is cancelled')
                    }
                    if (eventSlot.event.isCancelled) {
                        throw new Error('This event is cancelled')
                    }

                    const now = Date.now();
                    const oneWeekBefore = now - (1000 * 60 * 60 * 24 * 7);
                    const eventStart = new Date(event.start_date).getTime();
                    if (eventStart > oneWeekBefore) {
                        throw new Error('Booking has not started yet');
                    }

                    if (now > eventStart) {
                        throw new Error('Event has been already started')
                    }
                    if (event.available_seats < numberOfTickets) {

                        throw new Error(`Only ${event.available_seats} are available to book`)
                    }

                    let cart = await this.cartRepository.findOne({
                        where: {
                            user_id: userId
                        }
                    })

                    if (!cart) {
                        cart = cartRepo.create({
                            user_id: userId
                        })
                        cart = await cartRepo.save(cart);
                    }

                    let cartItem = await cartItemRepo.findOne({
                        where: {
                            cart: {
                                id: cart.id
                            },
                            eventSlot: { id: eventSlot.id }
                        }
                    })

                    if (cartItem) {
                        cartItem.quantity += numberOfTickets;
                    } else {
                        cartItem = cartItemRepo.create({
                            cart: cart,
                            eventSlot: eventSlot,
                            quantity: numberOfTickets,
                            price_snapshot: eventSlot.ticket_price,
                            reserved_until: new Date(Date.now() + 15 * 60 * 1000)
                        })
                    }

                    eventSlot.available_seats -= numberOfTickets;
                    await eventSlotRepo.save(eventSlot);
                    await cartItemRepo.save(cartItem);
                    return cartItem;
                }
            )
        } catch (err) {
            throw (err)
        }

    }



}