import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TicketPriority, TicketStatus } from '../types/ticket';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../services/toast';
import FormInput from './FormInput';
import { getErrorMessage } from '../services/errorTranslator';
import { useFormValidation } from '../hooks/useFormValidation';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TicketPrioritySelect, TicketStatusSelect } from './ui/entity-select';
import { SkeletonTicketForm } from './ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import { usePermissions } from "../hooks/usePermissions";
import { RichTextEditor } from './ui/rich-text-editor';

const TicketForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const permissions = usePermissions();
    const { forceValidate, registerFieldError, validateForm, fieldErrors } = useFormValidation();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW
    });

    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(!!id);

    useEffect(() => {
        if (id) ticketService.getById(id).then(t => setFormData({
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority
        })).catch((err) => { toast.error(getErrorMessage(err)); navigate('/') }).finally(() => setInitLoading(false));
    }, [id]);

    const MAX_DESCRIPTION_LENGTH = 10000;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let isDescriptionValid = true;

        if (!formData.description || formData.description === '<p></p>') {
            registerFieldError('description', 'Описание обязательно для заполнения');
            isDescriptionValid = false;
        }
        else if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
            registerFieldError('description', `Максимум ${MAX_DESCRIPTION_LENGTH} символов`);
            isDescriptionValid = false;
        } else {
            registerFieldError('description', '');
        }

        const { isValid } = await validateForm();
        if (!isValid || !isDescriptionValid) return;

        setLoading(true);
        try {
            if (id) {
                await ticketService.update(id, formData);
                toast.success('Тикет обновлен');
            } else {
                await ticketService.create({ ...formData, reporterId: user!.id });
                toast.success('Тикет создан');
            }
            navigate('/');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) return <SkeletonTicketForm />;

    return (
        <div className="max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {id ? 'Редактировать' : 'Создать'} тикет
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <FormInput
                            id="title"
                            name="title"
                            label="Заголовок"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            disabled={loading}
                            minLength={1}
                            maxLength={255}
                            forceValidate={forceValidate}
                            onValidationChange={registerFieldError}
                        />

                        <RichTextEditor
                            label="Описание"
                            value={formData.description}
                            onChange={(html) => {
                                setFormData({ ...formData, description: html });
                                if (html && html.length <= MAX_DESCRIPTION_LENGTH) {
                                    registerFieldError('description', '');
                                }
                            }}
                            error={fieldErrors['description']}
                            disabled={loading}
                            required
                            maxLength={MAX_DESCRIPTION_LENGTH}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Приоритет
                                </label>
                                <TicketPrioritySelect
                                    value={formData.priority}
                                    onChange={v => setFormData({ ...formData, priority: v as TicketPriority })}
                                    disabled={loading}
                                />
                            </div>
                            {id && permissions.canChangeTicketStatus &&
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Статус</label>
                                    <TicketStatusSelect
                                        value={formData.status}
                                        onChange={v => setFormData({ ...formData, status: v as TicketStatus })}
                                        disabled={loading}
                                    />
                                </div>
                            }
                        </div>

                        {!id && user &&
                            <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 text-sm">
                                Будет создан от имени: <strong>{user.firstName} {user.lastName}</strong>
                            </div>
                        }

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" loading={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {id ? 'Обновить' : 'Создать'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Отмена
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default TicketForm;