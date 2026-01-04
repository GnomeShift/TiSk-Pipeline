import { useState, useCallback, useRef } from 'react';

export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const useFormValidation = () => {
    const [forceValidate, setForceValidate] = useState(0);
    const fieldErrorsRef = useRef<Record<string, string>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const registerFieldError = useCallback((name: string, error: string) => {
        fieldErrorsRef.current[name] = error;
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    const clearFieldError = useCallback((name: string) => {
        delete fieldErrorsRef.current[name];
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }, []);

    const validateForm = useCallback((): Promise<FormValidationResult> => {
        return new Promise((resolve) => {
            setForceValidate(prev => prev + 1);

            // Little delay
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const errors = { ...fieldErrorsRef.current };
                    const isValid = Object.values(errors).every(error => !error);
                    resolve({ isValid, errors });
                }, 0);
            });
        });
    }, []);

    const resetValidation = useCallback(() => {
        fieldErrorsRef.current = {};
        setFieldErrors({});
        setForceValidate(0);
    }, []);

    return {
        forceValidate,
        fieldErrors,
        registerFieldError,
        clearFieldError,
        validateForm,
        resetValidation
    };
};