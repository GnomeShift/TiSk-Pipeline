import React, { useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import { cn } from '../services/utils';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { AlertCircle, Check, X } from 'lucide-react';
import { useFieldState } from '../hooks/useFieldState';

export interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

export interface FormInputRef {
    validate: () => string;
    getValue: () => string;
}

interface FormInputProps {
    type?: string;
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    autoFocus?: boolean;
    rules?: ValidationRule[];
    validateOnChange?: boolean;
    showSuccessState?: boolean;
    hint?: string;
    rows?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    forceValidate?: number;
    onValidationChange?: (name: string, error: string) => void;
}

const FormInput = forwardRef<FormInputRef, FormInputProps>(({
                                                                type = 'text',
                                                                id,
                                                                name,
                                                                label,
                                                                value,
                                                                onChange,
                                                                placeholder,
                                                                required = false,
                                                                disabled = false,
                                                                autoComplete,
                                                                autoFocus = false,
                                                                rules = [],
                                                                validateOnChange = false,
                                                                showSuccessState = true,
                                                                hint,
                                                                rows,
                                                                minLength,
                                                                maxLength,
                                                                pattern,
                                                                forceValidate = 0,
                                                                onValidationChange
                                                            }, ref) => {
    const isTextarea = type === 'textarea';

    const customValidate = useCallback((val: string): string => {
        if (minLength && val.length > 0 && val.length < minLength) return `Минимум ${minLength} символов`;
        if (maxLength && val.length > maxLength) return `Максимум ${maxLength} символов`;
        for (const rule of rules) {
            if (!rule.validate(val)) return rule.message;
        }
        return '';
    }, [minLength, maxLength, rules]);

    const { error, touched, focused, hasError, isValid: fieldIsValid, validate, handleBlur, handleFocus, clearError }
        = useFieldState(value, {name, required, label, validate: customValidate, onValidationChange, forceValidate });

    useImperativeHandle(ref, () => ({
        validate,
        getValue: () => value
    }), [validate, value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e);
        if (validateOnChange && touched) {
        } else if (error) {
            clearError();
        }
    }, [onChange, validateOnChange, touched, error, clearError]);

    const isValid = fieldIsValid && showSuccessState;

    const inputState = useMemo(() => {
        if (hasError) return 'error';
        if (isValid) return 'success';
        return 'default';
    }, [hasError, isValid]);

    const inputProps = {
        id,
        name,
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        onFocus: handleFocus,
        placeholder,
        disabled,
        autoComplete,
        autoFocus
    };

    return (
        <div className="space-y-1">
            {/* Label */}
            <Label htmlFor={id} state={hasError ? 'error' : 'default'} className="flex items-center gap-1">
                {label}
                {required && <span className="text-destructive font-bold">*</span>}
            </Label>

            {/* Input */}
            <div className="relative">
                {isTextarea ? (
                    <Textarea
                        {...inputProps}
                        state={inputState}
                        rows={rows || 4}
                        minLength={minLength}
                        maxLength={maxLength}
                        className="pr-10"
                    />
                ) : (
                    <Input
                        {...inputProps}
                        type={type}
                        state={inputState}
                        minLength={minLength}
                        maxLength={maxLength}
                        pattern={pattern}
                        className="pr-10"
                    />
                )}

                {/* Validation icon */}
                {touched && !focused && (
                    <ValidationIcon hasError={hasError} isValid={isValid} isTextarea={isTextarea} />
                )}
            </div>

            {/* Error, hint, character counter */}
            <div className="min-h-[1.25rem] flex items-start justify-between gap-2">
                <div className="flex-1">
                    {hasError ? (
                        <ErrorMessage id={id} message={error} />
                    ) : hint ? (
                        <p id={`${id}-hint`} className="text-sm text-muted-foreground">{hint}</p>
                    ) : null}
                </div>

                {maxLength && (
                    <CharacterCounter current={value.length} max={maxLength} />
                )}
            </div>
        </div>
    );
});

const ValidationIcon: React.FC<{ hasError: boolean; isValid: boolean; isTextarea: boolean }> =
    ({ hasError, isValid, isTextarea }) => (
        <div
            className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full',
                isTextarea && 'top-3 translate-y-0',
                hasError && 'bg-destructive text-white',
                isValid && 'bg-success text-white'
            )}
        >
            {hasError && <X className="w-3 h-3" />}
            {isValid && <Check className="w-3 h-3" />}
        </div>
    );

const ErrorMessage: React.FC<{ id: string; message: string }> = ({ id, message }) => (
    <div id={`${id}-error`} className="flex items-center gap-1 text-sm text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0" role="alert">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{message}</span>
    </div>
);

export const CharacterCounter: React.FC<{ current: number; max: number }> = ({ current, max }) => (
    <span
        className={cn(
            'text-xs text-muted-foreground flex-shrink-0 font-mono select-none',
            current > max * 0.9 && 'text-warning font-medium',
            current >= max && 'text-destructive font-bold'
        )}
    >
        {current}/{max}
    </span>
);

FormInput.displayName = 'FormInput';

export default FormInput;

// Validation rules
export const validationRules = {
    email: (): ValidationRule => ({
        validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Некорректный формат'
    }),

    password: (): ValidationRule => ({
        validate: (value) => !value || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
        message: 'Пароль должен содержать заглавные, строчные буквы и цифры'
    }),

    login: (): ValidationRule => ({
        validate: (value) => !value || /^[a-zA-Z0-9_]+$/.test(value),
        message: 'Только буквы, цифры и подчеркивания'
    }),

    phone: (): ValidationRule => ({
        validate: (value) => !value || /^$|^\+?[1-9]\d{0,10}$/.test(value),
        message: 'Некорректный формат'
    }),

    match: (getMatchValue: () => string, fieldName: string): ValidationRule => ({
        validate: (value) => value === getMatchValue(),
        message: `${fieldName} не совпадают`
    }),

    noSpaces: (): ValidationRule => ({
        validate: (value) => !value || !/\s/.test(value),
        message: 'Пробелы не допускаются'
    })
};