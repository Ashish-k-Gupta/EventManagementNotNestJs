export class EventDetailResponseDto {
    id!: number;
    title!: string;
    description!: string;
    language!: string;
    venue!: string;
    isCancelled!: boolean;
    categories!: string[];
    created_by!: number;
    users!: {
        firstName: string,
        lastName: string,
    }
    slots!: {
        id: number;
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
    id!: number;
    start_date!: Date;
    end_date!: Date;
    total_seats!: number;
    available_seats!: number;
    ticket_price!: number;
    is_cancelled!: boolean;
    is_sold_out!: boolean;
}