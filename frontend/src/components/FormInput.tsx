import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';

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
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    showSuccessState?: boolean;
    hint?: string;
    rows?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    externalError?: string;
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
                                                                validateOnBlur = true,
                                                                validateOnChange = false,
                                                                showSuccessState = true,
                                                                hint,
                                                                rows,
                                                                minLength,
                                                                maxLength,
                                                                pattern,
                                                                externalError,
                                                                forceValidate = 0,
                                                                onValidationChange
                                                            }, ref) => {
    const [error, setError] = useState<string>('');
    const [touched, setTouched] = useState(false);
    const [focused, setFocused] = useState(false);

    const isTextarea = type === 'textarea';

    // Memoize validation
    const validate = useCallback((val: string): string => {
        if (required && !val.trim()) {
            return `${label} обязательно для заполнения`;
        }

        if (minLength && val.length > 0 && val.length < minLength) {
            return `Минимум ${minLength} символов`;
        }

        if (maxLength && val.length > maxLength) {
            return `Максимум ${maxLength} символов`;
        }

        for (const rule of rules) {
            if (!rule.validate(val)) {
                return rule.message;
            }
        }

        return '';
    }, [required, label, minLength, maxLength, rules]);

    useImperativeHandle(ref, () => ({
        validate: () => {
            const err = validate(value);
            setError(err);
            setTouched(true);
            return err;
        },
        getValue: () => value
    }), [validate, value]);

    // Force validation on forceValidate change
    useEffect(() => {
        if (forceValidate > 0) {
            const err = validate(value);
            setError(err);
            setTouched(true);
            onValidationChange?.(name, err);
        }
    }, [forceValidate]);

    // External error
    useEffect(() => {
        if (externalError) {
            setError(externalError);
            setTouched(true);
        }
    }, [externalError]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e);
        const newValue = e.target.value;

        if (validateOnChange && touched) {
            const err = validate(newValue);
            setError(err);
            onValidationChange?.(name, err);
        } else if (error) {
            setError('');
            onValidationChange?.(name, '');
        }
    }, [onChange, validateOnChange, touched, validate, name, onValidationChange, error]);

    const handleBlur = useCallback(() => {
        setFocused(false);
        setTouched(true);

        if (validateOnBlur) {
            const err = validate(value);
            setError(err);
            onValidationChange?.(name, err);
        }
    }, [validateOnBlur, validate, value, name, onValidationChange]);

    const handleFocus = useCallback(() => {
        setFocused(true);
    }, []);

    const hasError = touched && !!error;
    const isValid = touched && !error && !!value && showSuccessState;

    const inputClassName = useMemo(() =>
            `form-control ${hasError ? 'input-error' : ''} ${focused ? 'input-focused' : ''}`,
        [hasError, focused]
    );

    return (
        <div className={`form-group ${hasError ? 'has-error' : ''}`}>
            <label htmlFor={id}>
                {label}
                {required && <span className="required-mark">*</span>}
            </label>

            <div className="input-wrapper">
                {isTextarea ? (
                    <textarea
                        id={id}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete={autoComplete}
                        autoFocus={autoFocus}
                        className={inputClassName}
                        aria-invalid={hasError ? true : undefined}
                        rows={rows || 4}
                        minLength={minLength}
                        maxLength={maxLength}
                    />
                ) : (
                    <input
                        id={id}
                        name={name}
                        type={type}
                        value={value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete={autoComplete}
                        autoFocus={autoFocus}
                        className={inputClassName}
                        aria-invalid={hasError ? true : undefined}
                        minLength={minLength}
                        maxLength={maxLength}
                        pattern={pattern}
                    />
                )}

                {touched && !focused && (
                    <span className={`input-icon ${hasError ? 'input-icon-error' : isValid ? 'input-icon-success' : ''}`}>
                        {hasError ? '✕' : isValid ? '✓' : ''}
                    </span>
                )}
            </div>

            {hasError && (
                <span id={`${id}-error`} className="error-message" role="alert">
                    <span className="error-icon">⚠</span>
                    {error}
                </span>
            )}

            {hint && !hasError && (
                <span id={`${id}-hint`} className="form-hint">
                    {hint}
                </span>
            )}

            {maxLength && (
                <span className={`char-counter ${value.length > maxLength * 0.9 ? 'char-counter-warning' : ''}`}>
                    {value.length}/{maxLength}
                </span>
            )}
        </div>
    );
});

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

    minLength: (min: number): ValidationRule => ({
        validate: (value) => !value || value.length >= min,
        message: `Минимум ${min} символов`
    }),

    maxLength: (max: number): ValidationRule => ({
        validate: (value) => value.length <= max,
        message: `Максимум ${max} символов`
    }),

    noSpaces: (): ValidationRule => ({
        validate: (value) => !value || !/\s/.test(value),
        message: 'Пробелы не допускаются'
    })
};