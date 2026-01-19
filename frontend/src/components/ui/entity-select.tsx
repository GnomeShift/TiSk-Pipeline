import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { TicketStatus, TicketPriority } from '../../types/ticket';
import { UserRole, UserStatus } from '../../types/user';
import { getTicketStatusLabel, getTicketPriorityLabel, getUserRoleLabel, getUserStatusLabel } from '../../services/utils';

interface SelectOption {
    value: string;
    label: string;
}

interface EntitySelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    allLabel?: string;
    includeAll?: boolean;
    disabled?: boolean;
    id?: string;
}

export const EntitySelect: React.FC<EntitySelectProps> = ({
                                                              value,
                                                              onChange,
                                                              options,
                                                              placeholder,
                                                              allLabel = 'Все',
                                                              includeAll = false,
                                                              disabled = false,
                                                              id
                                                          }) => (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder || (includeAll ? allLabel : 'Выберите...')} />
        </SelectTrigger>
        <SelectContent>
            {includeAll && <SelectItem value="ALL">{allLabel}</SelectItem>}
            {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
    </Select>
);

export const TICKET_STATUS_OPTIONS: SelectOption[] = [
    { value: TicketStatus.OPEN, label: getTicketStatusLabel(TicketStatus.OPEN) },
    { value: TicketStatus.IN_PROGRESS, label: getTicketStatusLabel(TicketStatus.IN_PROGRESS) },
    { value: TicketStatus.CLOSED, label: getTicketStatusLabel(TicketStatus.CLOSED) },
];

export const TICKET_PRIORITY_OPTIONS: SelectOption[] = [
    { value: TicketPriority.LOW, label: getTicketPriorityLabel(TicketPriority.LOW) },
    { value: TicketPriority.MEDIUM, label: getTicketPriorityLabel(TicketPriority.MEDIUM) },
    { value: TicketPriority.HIGH, label: getTicketPriorityLabel(TicketPriority.HIGH) },
    { value: TicketPriority.VERY_HIGH, label: getTicketPriorityLabel(TicketPriority.VERY_HIGH) },
];

export const USER_ROLE_OPTIONS: SelectOption[] = [
    { value: UserRole.USER, label: getUserRoleLabel(UserRole.USER) },
    { value: UserRole.SUPPORT, label: getUserRoleLabel(UserRole.SUPPORT) },
    { value: UserRole.ADMIN, label: getUserRoleLabel(UserRole.ADMIN) },
];

export const USER_STATUS_OPTIONS: SelectOption[] = [
    { value: UserStatus.ACTIVE, label: getUserStatusLabel(UserStatus.ACTIVE) },
    { value: UserStatus.INACTIVE, label: getUserStatusLabel(UserStatus.INACTIVE) },
    { value: UserStatus.SUSPENDED, label: getUserStatusLabel(UserStatus.SUSPENDED) },
];

type SelectProps = Omit<EntitySelectProps, 'options' | 'placeholder' | 'allLabel'>;

export const TicketStatusSelect: React.FC<SelectProps> = (props) => (
    <EntitySelect {...props} options={TICKET_STATUS_OPTIONS} placeholder="Выберите статус" allLabel="Все статусы" />
);

export const TicketPrioritySelect: React.FC<SelectProps> = (props) => (
    <EntitySelect {...props} options={TICKET_PRIORITY_OPTIONS} placeholder="Выберите приоритет" allLabel="Все приоритеты" />
);

export const UserRoleSelect: React.FC<SelectProps> = (props) => (
    <EntitySelect {...props} options={USER_ROLE_OPTIONS} placeholder="Выберите роль" allLabel="Все роли" />
);

export const UserStatusSelect: React.FC<SelectProps> = (props) => (
    <EntitySelect {...props} options={USER_STATUS_OPTIONS} placeholder="Выберите статус" allLabel="Все статусы" />
);