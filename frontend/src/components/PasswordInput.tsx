import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { cn } from '../services/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Check, X, Circle, AlertCircle } from 'lucide-react';

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

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    { id: 'minLength', label: 'Минимум 8 символов', validate: (v) => v.length >= 8 },
    { id: 'lowercase', label: 'Строчная буква (a-z)', validate: (v) => /[a-z]/.test(v) },
    { id: 'uppercase', label: 'Заглавная буква (A-Z)', validate: (v) => /[A-Z]/.test(v) },
    { id: 'digit', label: 'Цифра (0-9)', validate: (v) => /\d/.test(v) }
];

const STRENGTH_CONFIG = [
    { min: 0, label: '', color: 'bg-destructive', textColor: 'text-destructive' },
    { min: 1, label: 'Слабый', color: 'bg-destructive', textColor: 'text-destructive' },
    { min: 2, label: 'Средний', color: 'bg-amber-500', textColor: 'text-amber-500' },
    { min: 3, label: 'Хороший', color: 'bg-blue-500', textColor: 'text-blue-500' },
    { min: 4, label: 'Надежный', color: 'bg-success', textColor: 'text-success' }
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

    useEffect(() => { onValidationChangeRef.current = onValidationChange; }, [onValidationChange]);

    // Memoize requirements
    const { requirementsStatus, allPassed, passedCount } = useMemo(() => {
        const status = PASSWORD_REQUIREMENTS.map(req => ({
            ...req,
            passed: req.validate(value)
        }));
        return {
            requirementsStatus: status,
            allPassed: status.every(r => r.passed),
            passedCount: status.filter(r => r.passed).length
        };
    }, [value]);

    const strengthPercent = (passedCount / PASSWORD_REQUIREMENTS.length) * 100;
    const strengthInfo = STRENGTH_CONFIG[passedCount];

    // Memoize error getter
    const getError = useCallback((): string => {
        if (required && !value) return `${label} обязательно для заполнения`;
        if (value && !allPassed) return 'Пароль не соответствует требованиям';
        return '';
    }, [required, value, label, allPassed]);

    // Expose by ref
    useImperativeHandle(ref, () => ({
        validate: () => {
            setTouched(true);
            return getError();
        },
        getValue: () => value
    }), [getError, value]);

    // Force validation
    useEffect(() => {
        if (forceValidate > 0 && forceValidate !== prevForceValidateRef.current) {
            prevForceValidateRef.current = forceValidate;
            setTouched(true);
            onValidationChangeRef.current?.(name, getError());
        }
    }, [forceValidate, getError, name]);

    // Refresh validation on value change
    useEffect(() => {
        if (touched) {
            onValidationChangeRef.current?.(name, getError());
        }
    }, [value, touched, getError, name]);

    const handleBlur = useCallback(() => {
        setFocused(false);
        setTouched(true);
        onValidationChangeRef.current?.(name, getError());
    }, [getError, name]);

    // Error states
    const hasEmptyError = touched && required && !value;
    const hasRequirementsError = touched && !!value && !allPassed;
    const hasError = hasEmptyError || hasRequirementsError;
    const isValid = touched && value && allPassed;
    const showRequirementsList = showRequirements && (focused || hasRequirementsError) && value.length > 0;

    return (
        <div className="space-y-1">
            <Label htmlFor={id} state={hasError ? 'error' : 'default'} className="flex items-center gap-1">
                {label}
                {required && <span className="text-destructive font-bold">*</span>}
            </Label>

            <div className="relative">
                <Input
                    id={id}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onFocus={() => setFocused(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    state={hasError ? 'error' : isValid ? 'success' : 'default'}
                    className="pr-20"
                />

                {/* Hide password button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                    disabled={disabled}
                    className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                {touched && !focused && (hasError || isValid) && (
                    <div className={cn(
                        'absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full',
                        hasError ? 'bg-destructive text-white' : 'bg-success text-white'
                    )}>
                        {hasError ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </div>
                )}
            </div>

            {/* Error message for empty required field */}
            <div className="min-h-[1.25rem]">
                {hasEmptyError && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{label} обязательно для заполнения</span>
                    </div>
                )}
            </div>

            {/* Password strength indicator */}
            {value.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn('h-full rounded-full transition-all duration-300', strengthInfo.color)}
                            style={{ width: `${strengthPercent}%` }}
                        />
                    </div>
                    {strengthInfo.label && (
                        <span className={cn('text-xs font-semibold min-w-[60px] text-right', strengthInfo.textColor)}>
                            {strengthInfo.label}
                        </span>
                    )}
                </div>
            )}

            {/* Password requirements */}
            {showRequirementsList && (
                <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    {requirementsStatus.map(req => (
                        <div
                            key={req.id}
                            className={cn(
                                'flex items-center gap-2 text-sm transition-colors',
                                req.passed ? 'text-success' : 'text-muted-foreground'
                            )}
                        >
                            <div className="w-4 h-4 flex items-center justify-center">
                                {req.passed ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-2.5 h-2.5" />}
                            </div>
                            <span>{req.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;