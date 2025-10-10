export const getStatusColor = (status: string) => {
    switch (status) {
        case 'OPEN': return 'status-open';
        case 'IN_PROGRESS': return 'status-progress';
        case 'CLOSED': return 'status-closed';
        default: return '';
    }
};

export const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'HIGH': return 'priority-high';
        case 'MEDIUM': return 'priority-medium';
        case 'LOW': return 'priority-low';
        default: return '';
    }
};