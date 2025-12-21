import api from './api';
import { TicketStatisticsDTO, AssigneeStatisticsDTO, PeriodStatisticsDTO } from '../types/statistics';

export const statisticsService = {
    getAllStatistics: async (): Promise<TicketStatisticsDTO> => {
        const response = await api.get('/statistics');
        return response.data;
    },

    getStatisticsByStatus: async (): Promise<Record<string, number>> => {
        const response = await api.get('/statistics/by-status');
        return response.data;
    },

    getStatisticsByPriority: async (): Promise<Record<string, number>> => {
        const response = await api.get('/statistics/by-priority');
        return response.data;
    },

    getAllAssigneesStatistics: async (): Promise<AssigneeStatisticsDTO[]> => {
        const response = await api.get('/statistics/assignees');
        return response.data;
    },

    getAssigneeStatisticsById: async (assigneeId: string): Promise<AssigneeStatisticsDTO> => {
        const response = await api.get(`/statistics/assignees/${assigneeId}`);
        return response.data;
    },

    getPeriodStatistics: async (startDate: string, endDate: string): Promise<PeriodStatisticsDTO> => {
        const response = await api.get('/statistics/period', {
            params: { startDate, endDate }
        });
        return response.data;
    },

    getLastDaysStatistics: async (days: number): Promise<PeriodStatisticsDTO> => {
        const response = await api.get(`/statistics/last-days/${days}`);
        return response.data;
    },

    getStatisticsByDepartment: async (): Promise<Record<string, number>> => {
        const response = await api.get('/statistics/by-department');
        return response.data;
    },

    getMyStatistics: async (): Promise<AssigneeStatisticsDTO> => {
        const response = await api.get('/statistics/my');
        return response.data;
    }
};