import * as React from 'react';
import { cn } from '../../services/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { formFieldStateVariants } from './form-variants';

const textareaVariants = cva(
    'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors',
    {
        variants: {
            state: formFieldStateVariants,
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, state, ...props }, ref) => {
        return (
            <textarea
                className={cn(textareaVariants({ state, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };