import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../services/utils';

const labelVariants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors',
    {
        variants: {
            state: {
                default: 'text-foreground',
                error: 'text-destructive',
            },
        },
        defaultVariants: {
            state: 'default',
        },
    }
);

export interface LabelProps
    extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
        VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<
    React.ComponentRef<typeof LabelPrimitive.Root>,
    LabelProps
>(({ className, state, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ state, className }))} {...props} />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };