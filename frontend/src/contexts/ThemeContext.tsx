import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

const applyTheme = (theme: 'dark' | 'light') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
};

const getSystemTheme = (): 'dark' | 'light' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
                                                                children,
                                                                defaultTheme = 'system',
                                                                storageKey = 'tisk-theme',
                                                            }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Get theme from localStorage or use default
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey) as Theme;
            if (stored) return stored;
        }
        return defaultTheme;
    });

    // Calculate resolved theme
    const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

    useEffect(() => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolved);
        setResolvedTheme(resolved);
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
            setResolvedTheme(newTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme);
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};