import { CreateTicketDTO, TicketDTO, UpdateTicketDTO } from '../types/ticket.ts';
import api from './api.ts';

export const ticketService = {
    getAll: async (): Promise<TicketDTO[]> => {
        const response = await api.get('/tickets');
        if (response.data && response.data.content) {
            return response.data.content;
        }
        return response.data;
    },

    getMyTickets: async (): Promise<TicketDTO[]> => {
        const response = await api.get('/tickets/my');
        if (response.data && response.data.content) {
            return response.data.content;
        }
        return response.data;
    },

    getById: async (id: string): Promise<TicketDTO> => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    create: async (ticket: CreateTicketDTO): Promise<TicketDTO> => {
        const response = await api.post('/tickets', ticket);
        return response.data;
    },

    update: async (id: string, ticket: UpdateTicketDTO): Promise<TicketDTO> => {
        const response = await api.patch(`/tickets/${id}`, ticket);
        return response.data;
    },

    assignTicket: async (id: string, assigneeId: string): Promise<TicketDTO> => {
        const response = await api.patch(`/tickets/${id}/assign`, null, {
            params: { assigneeId }
        });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/tickets/${id}`);
    },
};