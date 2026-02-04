import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { statisticsService } from '../services/statisticsService';
import { TicketStatisticsDTO, AssigneeStatisticsDTO, PeriodStatisticsDTO } from '../types/statistics';
import { toast } from '../services/toast';
import { getTicketStatusColor, cn, getUserInitials, formatTime, formatDate } from '../services/utils';
import { UserRole } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { SkeletonStatistics } from './ui/skeleton';
import { CheckCircle2, Clock, FileText, RefreshCw, TrendingUp, Users, Activity, AlertCircle, Trophy, Medal } from 'lucide-react';
import { getErrorMessage } from '../services/errorTranslator';

type TabType = 'overview' | 'assignees' | 'trends';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-popover p-3 shadow-md text-popover-foreground text-sm">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color || entry.fill }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-medium">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface StatCardProps {
    icon: React.ElementType;
    iconColor?: string;
    iconBg?: string;
    value: string | number;
    label: string;
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
                                               icon: Icon,
                                               iconColor = "text-primary",
                                               iconBg = "bg-primary/10",
                                               value,
                                               label,
                                               description
                                           }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {label}
            </CardTitle>
            <div className={cn("p-2 rounded-full", iconBg)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{value}</div>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            )}
        </CardContent>
    </Card>
);

const Statistics: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allStats, setAllStats] = useState<TicketStatisticsDTO | null>(null);
    const [assigneesStats, setAssigneesStats] = useState<AssigneeStatisticsDTO[]>([]);
    const [periodStats, setPeriodStats] = useState<PeriodStatisticsDTO | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const loadStatistics = useCallback(async () => {
        try {
            setLoading(true);

            const [overall, period] = await Promise.all([
                statisticsService.getAllStatistics(),
                statisticsService.getLastDaysStatistics(selectedPeriod)
            ]);

            setAllStats(overall);
            setPeriodStats(period);

            if (user?.role === UserRole.ADMIN) {
                setAssigneesStats(await statisticsService.getAllAssigneesStatistics());
            }
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod, user?.role]);

    useEffect(() => { loadStatistics(); }, [loadStatistics]);

    const statusData = useMemo(() => {
        if (!allStats) return [];
        return [
            { name: 'Открытые', value: allStats.ticketsByStatus['OPEN'] || 0, color: getTicketStatusColor.OPEN },
            { name: 'В работе', value: allStats.ticketsByStatus['IN_PROGRESS'] || 0, color: getTicketStatusColor.IN_PROGRESS },
            { name: 'Закрытые', value: allStats.ticketsByStatus['CLOSED'] || 0, color: getTicketStatusColor.CLOSED },
        ].filter(item => item.value > 0);
    }, [allStats]);

    const trendData = useMemo(() => {
        if (!periodStats) return [];
        return periodStats.dailyStatistics.map(d => ({
            date: formatDate(d.date, { day: 'numeric', month: 'short' }),
            fullDate: formatDate(d.date),
            'Создано': d.created,
            'Закрыто': d.closed
        }));
    }, [periodStats]);

    // Top assignees calculation
    const topPerformers = useMemo(() => {
        return [...assigneesStats]
            .sort((a, b) => b.closedTickets - a.closedTickets)
            .slice(0, 5);
    }, [assigneesStats]);

    if (loading) return <SkeletonStatistics />;

    if (!allStats) return (
        <Card className="text-center py-12 border-dashed">
            <CardContent>
                <Activity className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-xl font-semibold">Нет данных</h3>
                <p className="text-sm text-muted-foreground mt-2">Статистика пока недоступна.</p>
            </CardContent>
        </Card>
    );

    const PERIOD_BUTTONS = [
        { days: 7, label: '7 дней' },
        { days: 14, label: '14 дней' },
        { days: 30, label: 'Месяц' },
        { days: 90, label: 'Квартал' }
    ];

    return (
        <div className="space-y-6 pb-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Статистика</h2>
                </div>
                <Button variant="outline" size="default" onClick={() => loadStatistics()} disabled={loading}>
                    <RefreshCw className={cn('w-3.5 h-3.5 mr-2', loading && 'animate-spin')} />
                    Обновить
                </Button>
            </div>

            {/* Tabs */}
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-muted/50 rounded-xs">
                        {[
                            { id: 'overview', icon: FileText, label: 'Обзор' },
                            { id: 'assignees', icon: Users, label: 'Сотрудники' },
                            { id: 'trends', icon: TrendingUp, label: 'Динамика' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={FileText}
                            value={allStats.totalTickets}
                            label="Всего тикетов"
                            description="За все время"
                        />
                        <StatCard
                            icon={AlertCircle}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-500/10"
                            value={allStats.unassignedTickets}
                            label="Не назначено"
                            description="Требуют внимания"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            iconColor="text-green-500"
                            iconBg="bg-green-500/10"
                            value={`${allStats.closedPercentage}%`}
                            label="Эффективность"
                            description="Процент закрытых"
                        />
                        <StatCard
                            icon={Clock}
                            iconColor="text-blue-500"
                            iconBg="bg-blue-500/10"
                            value={formatTime(allStats.averageResolutionTimeHours)}
                            label="Скорость"
                            description="Среднее время решения"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                        {/* Status chart */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg">Распределение по статусам</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                                <div className="h-[200px] w-full max-w-[250px] relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={90}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold tracking-tight">{allStats.totalTickets}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">Всего</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 w-full mt-4">
                                    {statusData.map((item) => (
                                        <div key={item.name} className="flex flex-col items-center text-center">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-sm text-muted-foreground font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-semibold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity bar */}
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Активность</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Сегодня', created: allStats.createdToday, closed: allStats.closedToday },
                                        { label: 'Эта неделя', created: allStats.createdThisWeek, closed: allStats.closedThisWeek },
                                        { label: 'Этот месяц', created: allStats.createdThisMonth, closed: allStats.closedThisMonth },
                                    ].map((item, i) => {
                                        const max = Math.max(item.created + item.closed, 10);
                                        return (
                                            <div key={i} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-semibold">{item.label}</span>
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        Всего: {item.created + item.closed}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="w-16 text-muted-foreground">Создано</span>
                                                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                                                                style={{ width: `${(item.created / max) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-8 text-right font-medium">{item.created}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="w-16 text-muted-foreground">Закрыто</span>
                                                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full transition-all duration-700 ease-out"
                                                                style={{ width: `${(item.closed / max) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-8 text-right font-medium">{item.closed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Trends */}
            {activeTab === 'trends' && periodStats && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base">Динамика</CardTitle>
                            </div>
                            <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-md">
                                {PERIOD_BUTTONS.map(({ days, label }) => (
                                    <Button
                                        key={days}
                                        variant={selectedPeriod === days ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedPeriod(days)}
                                        className="h-7 text-xs px-3"
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                                            tickMargin={13}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 13, fill: 'hsl(var(--muted-foreground))' }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="Создано"
                                            stroke="hsl(var(--primary))"
                                            fillOpacity={1}
                                            fill="url(#colorCreated)"
                                            strokeWidth={3}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Закрыто"
                                            stroke="#22c55e"
                                            fillOpacity={1}
                                            fill="url(#colorClosed)"
                                            strokeWidth={3}
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Создано</p>
                                    <p className="text-2xl font-bold mt-1">{periodStats.totalCreated}</p>
                                </div>
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Закрыто</p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">
                                        {periodStats.totalClosed}
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Конверсия</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {periodStats.totalCreated > 0
                                            ? Math.round((periodStats.totalClosed / periodStats.totalCreated) * 100)
                                            : 0}%
                                    </p>
                                </div>
                                <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Assignees */}
            {activeTab === 'assignees' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Table */}
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Эффективность сотрудников
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {assigneesStats.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">Данные отсутствуют.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-muted/30">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Сотрудник</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider text-center">Всего</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider text-center">В работе</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider text-center">Закрыто</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">Ср. время</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                        {assigneesStats.map((a) => (
                                            <tr key={a.assigneeId} className="hover:bg-muted/40 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/20 transition-all">
                                                            <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                                                                {getUserInitials(a.firstName, a.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-foreground text-sm">
                                                                {a.firstName} {a.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {a.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-secondary text-secondary-foreground font-semibold text-sm">
                                                        {a.totalAssigned}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {a.inProgressTickets > 0 ? (
                                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-semibold text-sm">
                                                            {a.inProgressTickets}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-green-600 font-bold text-base">
                                                        {a.closedTickets}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {formatTime(a.averageResolutionTimeHours)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leaderboard */}
                    {assigneesStats.length > 0 && (
                        <Card className="xl:col-span-1 h-fit">
                            <CardHeader className="bg-muted/20 border-b py-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-500" />
                                    Топ сотрудников
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {topPerformers.map((a, i) => {
                                        let medalColor = "text-muted-foreground";
                                        let rankBg = "bg-muted";

                                        if (i === 0) { medalColor = "text-yellow-500"; rankBg = "bg-yellow-500/10 text-yellow-600"; }
                                        if (i === 1) { medalColor = "text-slate-400"; rankBg = "bg-slate-400/10 text-slate-500"; }
                                        if (i === 2) { medalColor = "text-amber-700"; rankBg = "bg-amber-700/10 text-amber-800"; }

                                        return (
                                            <div key={a.assigneeId} className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm shrink-0",
                                                    rankBg
                                                )}>
                                                    {i < 3 ? <Medal className={cn("w-5 h-5", medalColor)} /> : `#${i + 1}`}
                                                </div>
                                                <div className="flex-1 min-w-0 grid grid-cols-1 gap-1">
                                                    <div className="flex items-center justify-between leading-none">
                                                        <p className="font-medium text-sm truncate pr-2">
                                                            {a.firstName} {a.lastName}
                                                        </p>
                                                        <span className="text-green-600 font-bold text-sm">
                                                            {a.closedTickets}
                                                        </span>
                                                    </div>
                                                    <div className="w-full flex items-center gap-2">
                                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 rounded-full"
                                                                style={{ width: `${a.totalAssigned > 0 ? (a.closedTickets / a.totalAssigned) * 100 : 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">
                                                             {a.totalAssigned > 0 ? Math.round((a.closedTickets / a.totalAssigned) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default Statistics;