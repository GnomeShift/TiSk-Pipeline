import React, { useEffect, useState } from 'react';
import { statisticsService } from '../services/statisticsService';
import { TicketStatisticsDTO, AssigneeStatisticsDTO, PeriodStatisticsDTO } from '../types/statistics';
import { useNotification } from '../contexts/NotificationContext';
import { getStatusColor, getStatusLabel} from '../services/utils';
import { UserRole } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

const Statistics: React.FC = () => {
    const { user } = useAuth();
    const notification = useNotification();

    const [loading, setLoading] = useState(true);
    const [allStats, setAllStats] = useState<TicketStatisticsDTO | null>(null);
    const [assigneesStats, setAssigneesStats] = useState<AssigneeStatisticsDTO[]>([]);
    const [periodStats, setPeriodStats] = useState<PeriodStatisticsDTO | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
    const [activeTab, setActiveTab] = useState<'overview' | 'assignees' | 'trends'>('overview');

    useEffect(() => {
        loadStatistics();
    }, [selectedPeriod])

    const loadStatistics = async () => {
        try {
            setLoading(true);

            const [overall, period] = await Promise.all([
                statisticsService.getAllStatistics(),
                statisticsService.getLastDaysStatistics(selectedPeriod)
            ]);

            setAllStats(overall);
            setPeriodStats(period);

            if (user?.role === UserRole.ADMIN) {
                const assignees = await statisticsService.getAllAssigneesStatistics();
                setAssigneesStats(assignees);
            }
        } catch (err: any) {
            notification.error('Ошибка загрузки статистики');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (hours: number | null): string => {
        if (hours === null || hours === undefined) return '—';
        if (hours < 1) return `${Math.round(hours * 60)} мин`;
        if (hours < 24) return `${hours.toFixed(1)} ч`;
        return `${Math.floor(hours / 24)} д ${Math.round(hours % 24)} ч`;
    };

    const getMaxValue = (data: Record<string, number>): number => {
        return Math.max(...Object.values(data), 1);
    };

    if (loading) return <div className="loading"></div>;

    if (!allStats) {
        return (
            <div className="empty-state">
                <p>Статистика отсутствует</p>
            </div>
        );
    }

    return (
        <div className="statistics-page">
            <div className="stats-header">
                <h2>Статистика</h2>
                <button className="btn btn-secondary" onClick={loadStatistics}>
                    Обновить
                </button>
            </div>

            <div className="stats-tabs">
                <button
                    className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Обзор
                </button>
                <button
                    className={`stats-tab ${activeTab === 'assignees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignees')}
                >
                    Исполнители
                </button>
                <button
                    className={`stats-tab ${activeTab === 'trends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trends')}
                >
                    Динамика
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="stats-cards">
                        <div className="stat-card stat-card-primary">
                            <div className="stat-icon">📋</div>
                            <div className="stat-content">
                                <div className="stat-value">{allStats.totalTickets}</div>
                                <div className="stat-label">Всего тикетов</div>
                            </div>
                        </div>

                        <div className="stat-card stat-card-warning">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <div className="stat-value">{allStats.unassignedTickets}</div>
                                <div className="stat-label">Не назначено</div>
                            </div>
                        </div>

                        <div className="stat-card stat-card-success">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <div className="stat-value">{allStats.closedPercentage}%</div>
                                <div className="stat-label">Закрыто</div>
                            </div>
                        </div>

                        <div className="stat-card stat-card-info">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-content">
                                <div className="stat-value">
                                    {formatTime(allStats.averageResolutionTimeHours)}
                                </div>
                                <div className="stat-label">Среднее время решения</div>
                            </div>
                        </div>
                    </div>

                    <div className="stats-period-summary">
                        <h3>Активность</h3>
                        <div className="period-cards">
                            <div className="period-card">
                                <div className="period-title">Сегодня</div>
                                <div className="period-stats">
                                    <div className="period-stat">
                                        <span className="period-stat-value text-success">+{allStats.createdToday}</span>
                                        <span className="period-stat-label">создано</span>
                                    </div>
                                    <div className="period-stat">
                                        <span className="period-stat-value text-primary">✓{allStats.closedToday}</span>
                                        <span className="period-stat-label">закрыто</span>
                                    </div>
                                </div>
                            </div>

                            <div className="period-card">
                                <div className="period-title">Эта неделя</div>
                                <div className="period-stats">
                                    <div className="period-stat">
                                        <span className="period-stat-value text-success">+{allStats.createdThisWeek}</span>
                                        <span className="period-stat-label">создано</span>
                                    </div>
                                    <div className="period-stat">
                                        <span className="period-stat-value text-primary">✓{allStats.closedThisWeek}</span>
                                        <span className="period-stat-label">закрыто</span>
                                    </div>
                                </div>
                            </div>

                            <div className="period-card">
                                <div className="period-title">Этот месяц</div>
                                <div className="period-stats">
                                    <div className="period-stat">
                                        <span className="period-stat-value text-success">+{allStats.createdThisMonth}</span>
                                        <span className="period-stat-label">создано</span>
                                    </div>
                                    <div className="period-stat">
                                        <span className="period-stat-value text-primary">✓{allStats.closedThisMonth}</span>
                                        <span className="period-stat-label">закрыто</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="stats-chart">
                        <div className="stats-section">
                            <h3>По статусам</h3>
                            <div className="bar-chart">
                                {Object.entries(allStats.ticketsByStatus).map(([status, count]) => (
                                    <div key={status} className="bar-item">
                                        <div className="bar-label">{getStatusLabel(status)}</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${(count / getMaxValue(allStats.ticketsByStatus)) * 100}%`,
                                                    backgroundColor: getStatusColor[status] || '#666'
                                                }}
                                            />
                                        </div>
                                        <div className="bar-value">{count}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="pie-chart-container">
                                <div
                                    className="pie-chart"
                                    style={{
                                        background: `conic-gradient(
                                            ${getStatusColor.OPEN} 0% ${allStats.openPercentage}%,
                                            ${getStatusColor.IN_PROGRESS} ${allStats.openPercentage}% ${allStats.openPercentage + allStats.inProgressPercentage}%,
                                            ${getStatusColor.CLOSED} ${allStats.openPercentage + allStats.inProgressPercentage}% 100%
                                        )`
                                    }}
                                >
                                    <div className="pie-center">
                                        <div className="pie-total">{allStats.totalTickets}</div>
                                        <div className="pie-label">всего</div>
                                    </div>
                                </div>
                                <div className="pie-legend">
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: getStatusColor.OPEN }}></span>
                                        <span>Открытые ({allStats.openPercentage}%)</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: getStatusColor.IN_PROGRESS }}></span>
                                        <span>В работе ({allStats.inProgressPercentage}%)</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: getStatusColor.CLOSED }}></span>
                                        <span>Закрытые ({allStats.closedPercentage}%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'assignees' && (
                <div className="assignee-stats">
                    <h3>Статистика по исполнителям</h3>

                    {assigneesStats.length === 0 ? (
                        <div className="empty-state">
                            <p>Нет данных</p>
                        </div>
                    ) : (
                        <div className="assignee-table-wrapper">
                            <table className="assignee-table">
                                <thead>
                                <tr>
                                    <th>Исполнитель</th>
                                    <th>Всего</th>
                                    <th>Открыто</th>
                                    <th>В работе</th>
                                    <th>Закрыто</th>
                                    <th>Среднее время</th>
                                </tr>
                                </thead>
                                <tbody>
                                {assigneesStats.map(assignee => (
                                    <tr key={assignee.assigneeId}>
                                        <td>
                                            <div className="assignee-info">
                                                <div className="user-avatar">
                                                    {assignee.firstName.charAt(0)}
                                                    {assignee.lastName.charAt(0)}
                                                </div>
                                                <div className="assignee-details">
                                                    <div className="assignee-name">
                                                        {assignee.firstName} {assignee.lastName}
                                                    </div>
                                                    <div className="assignee-email">{assignee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="stat-badge">{assignee.totalAssigned}</span>
                                        </td>
                                        <td>
                                            <span className="stat-badge stat-badge-open">
                                                {assignee.openTickets}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="stat-badge stat-badge-progress">
                                                {assignee.inProgressTickets}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="stat-badge stat-badge-closed">
                                                {assignee.closedTickets}
                                            </span>
                                        </td>
                                        <td>
                                            {formatTime(assignee.averageResolutionTimeHours)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {assigneesStats.length > 0 && (
                        <div className="top-performers">
                            <h4>🏆 Топ сотрудников</h4>
                            <div className="top-list">
                                {assigneesStats
                                    .sort((a, b) => b.closedTickets - a.closedTickets)
                                    .slice(0, 5)
                                    .map((assignee, index) => (
                                        <div key={assignee.assigneeId} className="top-item">
                                            <div className={`top-rank rank-${index + 1}`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </div>
                                            <div className="top-info">
                                                <div className="top-name">{assignee.firstName} {assignee.lastName}</div>
                                                <div className="top-stats">
                                                    {assignee.closedTickets} закрытых из {assignee.totalAssigned}
                                                </div>
                                            </div>
                                            <div className="top-score">{assignee.closedTickets}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'trends' && (
                <div className="trends-stats">
                    <div className="trends-header">
                        <h3>Динамика за период</h3>
                        <div className="period-selector">
                            <button
                                className={`period-btn ${selectedPeriod === 7 ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(7)}
                            >
                                7 дней
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === 14 ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(14)}
                            >
                                14 дней
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === 30 ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(30)}
                            >
                                1 месяц
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === 90 ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(90)}
                            >
                                3 месяца
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === 180 ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(180)}
                            >
                                полгода
                            </button>
                            <button
                                className={`period-btn ${selectedPeriod === 365 ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(365)}
                            >
                                год
                            </button>
                        </div>
                    </div>

                    {periodStats && (
                        <>
                            <div className="trends-summary">
                                <div className="trend-card">
                                    <div className="trend-value text-success">+{periodStats.totalCreated}</div>
                                    <div className="trend-label">Создано за период</div>
                                </div>
                                <div className="trend-card">
                                    <div className="trend-value text-primary">✓{periodStats.totalClosed}</div>
                                    <div className="trend-label">Закрыто за период</div>
                                </div>
                                <div className="trend-card">
                                    <div className={`trend-value ${periodStats.totalCreated > periodStats.totalClosed ? 'text-warning' : 'text-success'}`}>
                                        {periodStats.totalCreated - periodStats.totalClosed > 0 ? '+' : ''}{periodStats.totalCreated - periodStats.totalClosed}
                                    </div>
                                    <div className="trend-label">Баланс</div>
                                </div>
                            </div>

                            <div className="line-chart-container">
                                <div className="line-chart">
                                    {periodStats.dailyStatistics.map((day) => {
                                        const maxVal = Math.max(
                                            ...periodStats.dailyStatistics.map(d => Math.max(d.created, d.closed)),
                                            1
                                        );
                                        const createdHeight = (day.created / maxVal) * 100;
                                        const closedHeight = (day.closed / maxVal) * 100;

                                        return (
                                            <div key={day.date} className="chart-day">
                                                <div className="chart-bars">
                                                    <div
                                                        className="chart-bar chart-bar-created"
                                                        style={{ height: `${createdHeight}%` }}
                                                        title={`Создано: ${day.created}`}
                                                    >
                                                        {day.created > 0 && (
                                                            <span className="chart-bar-value">{day.created}</span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="chart-bar chart-bar-closed"
                                                        style={{ height: `${closedHeight}%` }}
                                                        title={`Закрыто: ${day.closed}`}
                                                    >
                                                        {day.closed > 0 && (
                                                            <span className="chart-bar-value">{day.closed}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="chart-label">
                                                    {new Date(day.date).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="chart-legend">
                                    <div className="legend-item">
                                        <span className="legend-color legend-created"></span>
                                        <span>Создано</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color legend-closed"></span>
                                        <span>Закрыто</span>
                                    </div>
                                </div>
                            </div>

                            <div className="daily-table-wrapper">
                                <table className="daily-table">
                                    <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Создано</th>
                                        <th>Закрыто</th>
                                        <th>Разница</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {periodStats.dailyStatistics.slice().reverse().map((day) => (
                                        <tr key={day.date}>
                                            <td>
                                                {new Date(day.date).toLocaleDateString('ru-RU', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </td>
                                            <td>
                                                <span className="text-success">+{day.created}</span>
                                            </td>
                                            <td>
                                                <span className="text-primary">✓{day.closed}</span>
                                            </td>
                                            <td>
                                                    <span className={day.created > day.closed ? 'text-warning' : 'text-success'}>
                                                        {day.created - day.closed > 0 ? '+' : ''}{day.created - day.closed}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Statistics;