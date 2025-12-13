export class EventDetailResponseDto {
    id!: string;
    title!: string;
    description!: string;
    language!: string;
    venue!: string;
    isCancelled!: boolean;
    categories!: string[];
    created_by!: string | number;
    users!: {
        firstName: string,
        lastName: string,
    }
    slots!: {
        id: string;
        start_date: Date;
        end_date: Date;
        total_seats: number;
        available_seats: number;
        ticket_price: number;
        is_cancelled: boolean;
        is_sold_out: boolean;
    }[];
}

export class slotReponseDto {
    id!: string;
    start_date!: Date;
    end_date!: Date;
    total_seats!: number;
    available_seats!: number;
    ticket_price!: number;
    is_cancelled!: boolean;
    is_sold_out!: boolean;
    event!: {
        id: string,
        title: string,
        venue: string
    }
}

export class EventSlotListResponseDto {
    id!: string;
    title!: string;
    venue!: string;
    isCancelled!: boolean;
    slots!: {
        id: string;
        start_date: Date;
        end_date: Date;
        total_seats: number;
        available_seats: number;
        ticket_price: number;
        is_cancelled: boolean;
        is_sold_out: boolean;
    }[];
}
