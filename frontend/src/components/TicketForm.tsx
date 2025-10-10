import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {CreateTicketDto, TicketPriority, TicketStatus, UpdateTicketDto} from '../types/ticket';
import {ticketService} from '../services/ticketService';

const TicketForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: TicketStatus.OPEN || TicketStatus.IN_PROGRESS || TicketStatus.CLOSED,
        priority: TicketPriority.LOW || TicketPriority.MEDIUM || TicketPriority.HIGH || TicketPriority.VERY_HIGH
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadTicket(id);
        }
    }, [id, isEdit]);

    const loadTicket = async (ticketId: string) => {
        try {
            setLoading(true);
            const ticket = await ticketService.getById(ticketId);
            setFormData({
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority
            });
        }
        catch (err) {
            setError('Ошибка загрузки тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (isEdit && id) {
                const updateData: UpdateTicketDto = {
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: formData.priority
                };
                await ticketService.update(id, updateData);
            }
            else {
                const createData: CreateTicketDto = {
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority
                };
                await ticketService.create(createData);
            }
            navigate('/');
        }
        catch (err) {
            setError('Ошибка при сохранении тикета');
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading && isEdit) return <div className="loading"/>;

    return (
        <div className="ticket-form">
            <h2>{isEdit ? 'Редактировать тикет' : 'Создать новый тикет'}</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Заголовок *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="form-control"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">Приоритет</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value={TicketPriority.LOW}>Низкий</option>
                            <option value={TicketPriority.MEDIUM}>Средний</option>
                            <option value={TicketPriority.HIGH}>Высокий</option>
                            <option value={TicketPriority.VERY_HIGH}>Очень высокий</option>
                        </select>
                    </div>

                    {isEdit && (
                        <div className="form-group">
                            <label htmlFor="status">Статус</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value={TicketStatus.OPEN}>Открыт</option>
                                <option value={TicketStatus.IN_PROGRESS}>В работе</option>
                                <option value={TicketStatus.CLOSED}>Закрыт</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketForm;