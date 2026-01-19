import * as React from 'react';
import { cn } from '../../services/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { formFieldStateVariants } from './form-variants';

const inputVariants = cva(
    'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
    {
        variants: {
            state: formFieldStateVariants,
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, state, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ state, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export { Input, inputVariants };