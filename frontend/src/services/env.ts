interface RuntimeConfig {
    API_URL: string;
    APP_TITLE: string;
}

declare global {
    interface Window {
        __RUNTIME_CONFIG__?: RuntimeConfig;
    }
}

const isValidValue = (value: string | undefined): value is string => {
    return Boolean(value && !value.startsWith('${') && value !== 'undefined');
};

export const env = {
    get apiUrl(): string {
        const runtime = window.__RUNTIME_CONFIG__?.API_URL;
        if (isValidValue(runtime)) {
            return runtime;
        }
        return import.meta.env.VITE_API_URL;
    },

    get appTitle(): string {
        const runtime = window.__RUNTIME_CONFIG__?.APP_TITLE;
        if (isValidValue(runtime)) {
            return runtime;
        }
        return import.meta.env.VITE_APP_TITLE;
    }
};