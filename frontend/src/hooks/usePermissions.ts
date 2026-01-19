import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import { TicketDTO } from '../types/ticket';
import { useMemo } from 'react';

export function usePermissions() {
    const { user } = useAuth();

    return useMemo(() => {
        const isAdmin = user?.role === UserRole.ADMIN;
        const isSupport = user?.role === UserRole.SUPPORT;
        const isStaff = isAdmin || isSupport;

        return {
            user,
            isAdmin,
            isSupport,
            isStaff,
            // General perms
            canManageUsers: isAdmin,
            canViewStatistics: isAdmin,
            canAssignTickets: isAdmin,
            canChangeTicketStatus: isStaff,
            canDeleteTickets: isAdmin,

            canEditTicket: (ticket: TicketDTO | null) => {
                if (!ticket || !user) return false;
                return isStaff || ticket.reporter?.id === user.id;
            },

            canTakeTicket: (ticket: TicketDTO | null) => {
                if (!ticket || !user) return false;
                return isStaff && !ticket.assignee && ticket.status !== 'CLOSED';
            },

            canDeleteTicket: (ticket: TicketDTO | null) => {
                return isAdmin && !!ticket;
            }
        };
    }, [user]);
}