export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
    updatedAt: string;
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED'
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH'
}

export interface CreateTicketDto {
    title: string;
    description: string;
    priority: TicketPriority;
}

export interface UpdateTicketDto {
    title?: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
}