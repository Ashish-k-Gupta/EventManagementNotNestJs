export class EventDetailResponseDto {
    id!: number;
    title!: string;
    description!: string;
    language!: string;
    totalSeats!: number;
    availableSeats!: number;
    ticketPrice!: number;
    startDate!: Date;
    endDate!: Date;
    isCancelled!: boolean;
    categories!: string[];
}