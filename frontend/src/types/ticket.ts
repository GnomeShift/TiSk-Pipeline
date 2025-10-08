export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    created_at: string;
    updated_at: string;
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED'
}

export interface CreateTicketDto {
    title: string;
    description: string;
}

export interface UpdateTicketDto {
    title?: string;
    description?: string;
    status: TicketStatus;
}