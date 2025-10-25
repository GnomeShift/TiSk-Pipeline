import React from 'react';
import { TicketStatus, TicketPriority } from '../types/ticket';
import {getPriorityLabel, getStatusLabel} from '../services/utils';

interface TicketFiltersProps {
    search: string;
    status: string;
    priority: string;
    sortBy: string;
    sortOrder: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPriorityChange: (value: string) => void;
    onSortByChange: (value: string) => void;
    onSortOrderChange: (value: string) => void;
    onReset: () => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
                                                         search,
                                                         status,
                                                         priority,
                                                         sortBy,
                                                         sortOrder,
                                                         onSearchChange,
                                                         onStatusChange,
                                                         onPriorityChange,
                                                         onSortByChange,
                                                         onSortOrderChange,
                                                         onReset
                                                     }) => {
    return (
        <div className="ticket-filters">
            <div className="filters-row">
                <div className="filter-group search-group">
                    <label htmlFor="search">Поиск</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Поиск по заголовку, описанию или ID..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="filters-row">
                <div className="filter-group">
                    <label htmlFor="status">Статус</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">Все статусы</option>
                        <option value={TicketStatus.OPEN}>{getStatusLabel(TicketStatus.OPEN)}</option>
                        <option value={TicketStatus.IN_PROGRESS}>{getStatusLabel(TicketStatus.IN_PROGRESS)}</option>
                        <option value={TicketStatus.CLOSED}>{getStatusLabel(TicketStatus.CLOSED)}</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="priority">Приоритет</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">Все приоритеты</option>
                        <option value={TicketPriority.LOW}>{getPriorityLabel(TicketPriority.LOW)}</option>
                        <option value={TicketPriority.MEDIUM}>{getPriorityLabel(TicketPriority.MEDIUM)}</option>
                        <option value={TicketPriority.HIGH}>{getPriorityLabel(TicketPriority.HIGH)}</option>
                        <option value={TicketPriority.VERY_HIGH}>{getPriorityLabel(TicketPriority.VERY_HIGH)}</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="sortBy">Сортировать по</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => onSortByChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="createdAt">Дате создания</option>
                        <option value="updatedAt">Дате обновления</option>
                        <option value="priority">Приоритету</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="sortOrder">Порядок</label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="desc">По убыванию</option>
                        <option value="asc">По возрастанию</option>
                    </select>
                </div>

                <div className="filter-group filter-actions">
                    <button onClick={onReset} className="btn btn-secondary">
                        Сбросить фильтры
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketFilters;