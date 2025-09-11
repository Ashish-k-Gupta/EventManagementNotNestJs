export class EventDetailResponseDto {
    id!: number;
    title!: string;
    description!: string;
    language!: string;
    isCancelled!: boolean;
    categories!: string[];
    slots!: {
        id: number;
        start_date: string;
        end_date: string;
        total_seats: number;
        available_seats: number;
        ticket_price: number;
        is_cancelled: boolean;
        is_sold_out: boolean;
    }[];
}