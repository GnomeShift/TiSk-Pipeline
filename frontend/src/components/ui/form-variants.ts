// State variants
export const formFieldStateVariants = {
    default: 'border-input focus-visible:ring-ring',
    error: 'border-destructive focus-visible:ring-destructive bg-destructive/5',
    success: 'border-success focus-visible:ring-success',
} as const;