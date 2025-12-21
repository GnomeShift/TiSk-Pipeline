export interface TicketStatisticsDTO {
    totalTickets: number;
    unassignedTickets: number;
    ticketsByStatus: Record<string, number>;
    ticketsByPriority: Record<string, number>;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
    closedToday: number;
    closedThisWeek: number;
    closedThisMonth: number;
    averageResolutionTimeHours: number | null;
    openPercentage: number;
    inProgressPercentage: number;
    closedPercentage: number;
}

export interface AssigneeStatisticsDTO {
    assigneeId: string;
    firstName: string;
    lastName: string;
    email: string;
    totalAssigned: number;
    openTickets: number;
    inProgressTickets: number;
    closedTickets: number;
    averageResolutionTimeHours: number | null;
}

export interface DailyStatisticsDTO {
    date: string;
    created: number;
    closed: number;
}

export interface PeriodStatisticsDTO {
    startDate: string;
    endDate: string;
    totalCreated: number;
    totalClosed: number;
    dailyStatistics: DailyStatisticsDTO[];
}