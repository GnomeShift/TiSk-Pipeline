import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TicketDTO, TicketStatus } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { getTicketStatusVariant, getTicketStatusLabel, getTicketPriorityVariant, getTicketPriorityLabel, getUserRoleVariant, getUserRoleLabel, cn, formatDateTime, getUserInitials } from '../services/utils';
import { useAuth } from '../contexts/AuthContext';
import { UserDTO, UserRole } from '../types/user';
import { toast } from '../services/toast';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { SkeletonTicketDetail } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { TicketStatusSelect } from './ui/entity-select';
import { useDeleteConfirm } from './ui/confirm-dialog';
import { usePermissions } from '../hooks/usePermissions';
import { ArrowLeft, ArrowRight, Building2, Edit, Loader2, Target, Trash2, UserPlus } from 'lucide-react';

const TicketDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const deleteConfirm = useDeleteConfirm();
    const permissions = usePermissions();
    const [ticket, setTicket] = useState<TicketDTO | null>(null);
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        if (id) {
            ticketService.getById(id).then(setTicket).catch(() => {
                toast.error('Тикет не найден');
                navigate('/'); }).finally(() => setLoading(false));
            if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPPORT) {
                userService.getAll().then(data =>
                    setUsers(data.filter(u => (u.role === UserRole.SUPPORT ||
                        u.role === UserRole.ADMIN) && u.status === 'ACTIVE')
                    )
                );
            }
        }
    }, [id, user]);

    const handleStatus = async (status: string) => {
        if (ticket) setTicket(await ticketService.update(ticket.id, {
            ...ticket,
            status: status as TicketStatus,
            reporterId: ticket.reporter?.id
        }));
        toast.success(`Статус изменен на "${getTicketStatusLabel(status as string)}"`);
    };

    const handleAssign = async (assigneeId: string) => {
        if (!ticket) return;
        setAssigningId(assigneeId);
        try {
            setTicket(await ticketService.assignTicket(ticket.id, assigneeId));
            setShowAssignModal(false);
            toast.success('Тикет назначен');
        } finally {
            setAssigningId(null);
        }
    };

    const handleDelete = async () => {
        if (ticket && await deleteConfirm(`тикет "${ticket.title}"`)) {
            await ticketService.delete(ticket.id);
            toast.success('Тикет удален');
            navigate('/');
        }
    };

    if (loading) return <SkeletonTicketDetail />;
    if (!ticket) return null;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <CardTitle className="text-xl">
                            Тикет #{ticket.id.substring(0, 8)}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {permissions.canEditTicket(ticket) &&
                            <Button variant="outline" asChild>
                                <Link to={`/edit/${ticket.id}`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Редактировать
                                </Link>
                            </Button>
                        }
                        {permissions.canDeleteTicket(ticket) &&
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить
                            </Button>
                        }
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl break-words">{ticket.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground">Описание</h4>
                            <p className="whitespace-pre-wrap break-words">{ticket.description}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <span className="text-sm font-medium text-muted-foreground">Статус</span>
                                {permissions.canChangeTicketStatus ? <TicketStatusSelect value={ticket.status} onChange={handleStatus} /> :
                                    <Badge variant={getTicketStatusVariant(ticket.status)}>
                                        {getTicketStatusLabel(ticket.status)}
                                    </Badge>}
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-sm font-medium text-muted-foreground">Приоритет</span>
                                <div>
                                    <Badge variant={getTicketPriorityVariant(ticket.priority)}>
                                        {getTicketPriorityLabel(ticket.priority)}
                                    </Badge>
                                </div>
                            </div>

                            {[
                                { label: 'Автор', u: ticket.reporter },
                                { label: 'Исполнитель', u: ticket.assignee }
                            ].map(({ label, u }, i) => (
                                <div key={i} className="space-y-1.5">
                                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                                    {u ? <div className="flex items-center gap-2">
                                            <Avatar size="sm">
                                                <AvatarFallback>
                                                    {getUserInitials(u.firstName, u.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                            </div>
                                        </div> : <p className="text-sm text-muted-foreground italic">—</p>
                                    }
                                </div>
                            ))}

                            <div className="space-y-1.5">
                                <span className="text-sm font-medium text-muted-foreground">Создан</span>
                                <p className="text-sm">{formatDateTime(ticket.createdAt)}</p>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-sm font-medium text-muted-foreground">Обновлен</span>
                                <p className="text-sm">{formatDateTime(ticket.updatedAt)}</p>
                            </div>

                            {(permissions.canTakeTicket(ticket) || permissions.canAssignTickets) && (
                                <div className="pt-3 space-y-2">
                                    {permissions.canTakeTicket(ticket) &&
                                        <Button onClick={() => handleAssign(user!.id)} className="w-full">
                                            <Target className="w-4 h-4 mr-2" />
                                                Взять в работу
                                        </Button>
                                    }
                                    {permissions.canAssignTickets &&
                                        <Button variant="outline" onClick={() => setShowAssignModal(true)} className="w-full">
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Назначить
                                        </Button>
                                    }
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Назначить исполнителя</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6 space-y-2">
                        {users.map(u => {
                            const isCurrent = ticket.assignee?.id === u.id;
                            return (
                                <button
                                    key={u.id}
                                    onClick={() => !isCurrent && handleAssign(u.id)}
                                    disabled={assigningId === u.id}
                                    className={cn(
                                        'w-full flex items-center justify-between p-4 rounded-lg border-2 text-left transition-all',
                                        isCurrent ? 'bg-green-50 border-green-500' : 'bg-muted/50 border-transparent hover:border-primary'
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <Avatar>
                                            <AvatarFallback>
                                                {getUserInitials(u.firstName, u.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{u.firstName} {u.lastName}</span>
                                                {isCurrent && <Badge variant="success" className="text-xs">Текущий</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-muted-foreground truncate">{u.email}</span>
                                                <Badge variant={getUserRoleVariant(u.role)} className="text-xs">
                                                    {getUserRoleLabel(u.role)}
                                                </Badge>
                                            </div>
                                            {u.department && <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                                <Building2 className="w-3 h-3" />
                                                <span className="truncate">{u.department}</span>
                                            </div>}
                                        </div>
                                    </div>
                                    {!isCurrent &&
                                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground ml-3">
                                            {assigningId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        </div>
                                    }
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TicketDetail;