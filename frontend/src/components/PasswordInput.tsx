import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';

interface PasswordRequirement {
    id: string;
    label: string;
    validate: (value: string) => boolean;
}

export interface PasswordInputRef {
    validate: () => string;
    getValue: () => string;
}

interface PasswordInputProps {
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    showRequirements?: boolean;
    forceValidate?: number;
    onValidationChange?: (name: string, error: string) => void;
}

const passwordRequirements: PasswordRequirement[] = [
    {
        id: 'minLength',
        label: 'Минимум 8 символов',
        validate: (value) => value.length >= 8
    },
    {
        id: 'lowercase',
        label: 'Строчная буква (a-z)',
        validate: (value) => /[a-z]/.test(value)
    },
    {
        id: 'uppercase',
        label: 'Заглавная буква (A-Z)',
        validate: (value) => /[A-Z]/.test(value)
    },
    {
        id: 'digit',
        label: 'Цифра (0-9)',
        validate: (value) => /\d/.test(value)
    }
];

const PasswordInput = forwardRef<PasswordInputRef, PasswordInputProps>(({
                                                                            id,
                                                                            name,
                                                                            label,
                                                                            value,
                                                                            onChange,
                                                                            placeholder = '••••••••',
                                                                            required = false,
                                                                            disabled = false,
                                                                            autoComplete,
                                                                            showRequirements = true,
                                                                            forceValidate = 0,
                                                                            onValidationChange
                                                                        }, ref) => {
    const [focused, setFocused] = useState(false);
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Ref for tracking previous forceValidate
    const prevForceValidateRef = useRef(forceValidate);

    // Ref for storing callback
    const onValidationChangeRef = useRef(onValidationChange);
    useEffect(() => {
        onValidationChangeRef.current = onValidationChange;
    }, [onValidationChange]);

    // Memoize requirements status
    const requirementsStatus = useMemo(() => {
        return passwordRequirements.map(req => ({
            ...req,
            passed: req.validate(value)
        }));
    }, [value]);

    const allPassed = useMemo(() =>
            requirementsStatus.every(req => req.passed),
        [requirementsStatus]
    );

    const passedCount = useMemo(() =>
            requirementsStatus.filter(req => req.passed).length,
        [requirementsStatus]
    );

    const strengthPercent = useMemo(() =>
            (passedCount / passwordRequirements.length) * 100,
        [passedCount]
    );

    // Memoize strength indicator
    const strengthInfo = useMemo(() => {
        let label: string;
        let color: string;

        if (passedCount === 0) {
            label = '';
            color = '#dc3545';
        } else if (passedCount === 1) {
            label = 'Слабый';
            color = '#dc3545';
        } else if (passedCount === 2) {
            label = 'Средний';
            color = '#ffc107';
        } else if (passedCount === 3) {
            label = 'Хороший';
            color = '#17a2b8';
        } else {
            label = 'Надежный';
            color = '#28a745';
        }

        return { label, color };
    }, [passedCount]);

    // Memoize error getter
    const getError = useCallback((): string => {
        if (required && !value) {
            return `${label} обязательно для заполнения`;
        }
        if (value && !allPassed) {
            return 'Пароль не соответствует требованиям';
        }
        return '';
    }, [required, value, label, allPassed]);

    // Expose by ref
    useImperativeHandle(ref, () => ({
        validate: () => {
            const err = getError();
            setTouched(true);
            return err;
        },
        getValue: () => value
    }), [getError, value]);

    // Force validation
    useEffect(() => {
        if (forceValidate > 0 && forceValidate !== prevForceValidateRef.current) {
            prevForceValidateRef.current = forceValidate;
            setTouched(true);
            const err = getError();
            onValidationChangeRef.current?.(name, err);
        }
    }, [forceValidate, getError, name]);

    // Refresh validation on value change
    useEffect(() => {
        if (touched) {
            const err = getError();
            onValidationChangeRef.current?.(name, err);
        }
    }, [value, allPassed, touched, getError, name]);

    const handleBlur = useCallback(() => {
        setFocused(false);
        setTouched(true);
        const err = getError();
        onValidationChangeRef.current?.(name, err);
    }, [getError, name]);

    const handleFocus = useCallback(() => {
        setFocused(true);
    }, []);

    const toggleShowPassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Calculate states
    const hasError = touched && ((required && !value) || (!!value && !allPassed));
    const showRequirementsList = showRequirements && (focused || (touched && !allPassed)) && value.length > 0;

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

            <div className="input-wrapper password-input-wrapper">
                <input
                    id={id}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={inputClassName}
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleShowPassword}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    disabled={disabled}
                >
                    {showPassword ? '🙈' : '👁️'}
                </button>

                {touched && !focused && value && (
                    <span className={`input-icon ${hasError ? 'input-icon-error' : 'input-icon-success'}`}>
                        {hasError ? '✕' : '✓'}
                    </span>
                )}
            </div>

            {/* Error message for empty required field */}
            {touched && required && !value && (
                <span className="error-message" role="alert">
                    <span className="error-icon">⚠</span>
                    {label} обязательно для заполнения
                </span>
            )}

            {/* Password strength indicator */}
            {value.length > 0 && (
                <div className="password-strength">
                    <div className="password-strength-bar">
                        <div
                            className="password-strength-fill"
                            style={{
                                width: `${strengthPercent}%`,
                                backgroundColor: strengthInfo.color
                            }}
                        />
                    </div>
                    {strengthInfo.label && (
                        <span
                            className="password-strength-label"
                            style={{ color: strengthInfo.color }}
                        >
                            {strengthInfo.label}
                        </span>
                    )}
                </div>
            )}

            {/* Password requirements */}
            {showRequirementsList && (
                <div className="password-requirements">
                    {requirementsStatus.map(req => (
                        <div
                            key={req.id}
                            className={`requirement ${req.passed ? 'requirement-passed' : 'requirement-failed'}`}
                        >
                            <span className="requirement-icon">
                                {req.passed ? '✓' : '○'}
                            </span>
                            <span className="requirement-label">{req.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;