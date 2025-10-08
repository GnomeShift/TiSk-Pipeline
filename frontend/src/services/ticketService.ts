import { CreateTicketDto, Ticket, UpdateTicketDto } from '../types/ticket.ts';
import api from './api.ts';

export const ticketService = {
    getAll: async (): Promise<Ticket[]> => {
        const response = await api.get('/tickets');
        return response.data;
    },

    getById: async (id: string): Promise<Ticket> => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    create: async (ticket: CreateTicketDto): Promise<Ticket> => {
        const response = await api.post('/tickets', ticket);
        return response.data;
    },

    update: async (id: string, ticket: UpdateTicketDto): Promise<Ticket> => {
        const response = await api.patch(`/tickets/${id}`, ticket);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tickets/${id}`);
    },
};