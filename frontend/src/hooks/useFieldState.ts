import { useState, useCallback, useEffect, useRef } from 'react';

interface UseFieldStateOptions {
    name: string;
    required?: boolean;
    label: string;
    validate?: (value: string) => string;
    onValidationChange?: (name: string, error: string) => void;
    forceValidate?: number;
}

export function useFieldState(value: string, options: UseFieldStateOptions) {
    const { name, required = false, label, validate: customValidate, onValidationChange, forceValidate = 0 } = options;
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);
    const [focused, setFocused] = useState(false);
    const prevForceValidateRef = useRef(forceValidate);
    const onValidationChangeRef = useRef(onValidationChange);

    useEffect(() => {
        onValidationChangeRef.current = onValidationChange;
    }, [onValidationChange]);

    const validate = useCallback((val: string): string => {
        if (required && !val.trim()) {
            return `${label} обязательно для заполнения`;
        }
        return customValidate?.(val) ?? '';
    }, [required, label, customValidate]);

    const runValidation = useCallback((val: string): string => {
        const err = validate(val);
        setError(err);
        setTouched(true);
        onValidationChangeRef.current?.(name, err);
        return err;
    }, [validate, name]);

    // Force validation
    useEffect(() => {
        if (forceValidate > 0 && forceValidate !== prevForceValidateRef.current) {
            prevForceValidateRef.current = forceValidate;
            runValidation(value);
        }
    }, [forceValidate, value, runValidation]);

    const handleBlur = useCallback(() => {
        setFocused(false);
        runValidation(value);
    }, [value, runValidation]);

    const handleFocus = useCallback(() => {
        setFocused(true);
    }, []);

    const clearError = useCallback(() => {
        setError('');
        onValidationChangeRef.current?.(name, '');
    }, [name]);

    const hasError = touched && !!error;
    const isValid = touched && !error && !!value;

    return {
        error,
        touched,
        focused,
        hasError,
        isValid,
        validate: () => runValidation(value),
        handleBlur,
        handleFocus,
        clearError,
        setTouched
    };
}