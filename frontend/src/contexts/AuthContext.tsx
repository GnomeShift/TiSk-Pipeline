import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, LoginDTO, RegisterDTO, ChangePasswordDTO } from '../types/auth';
import { UserDTO } from '../types/user'
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
    login: (credentials: LoginDTO) => Promise<void>;
    register: (data: RegisterDTO) => Promise<void>;
    logout: () => void;
    updateUser: (user: UserDTO) => void;
    changePassword: (data: ChangePasswordDTO) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true
    });

    // Memoized logout
    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false
        });
    }, []);

    // Listening for logout event from interceptor
    useEffect(() => {
        const handleLogoutEvent = () => {
            logout();
        };

        window.addEventListener('auth:logout', handleLogoutEvent);
        return () => window.removeEventListener('auth:logout', handleLogoutEvent);
    }, [logout]);

    // Check auth on mount
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');

            if (accessToken && refreshToken) {
                try {
                    const currentUser = await authService.getCurrentUser();

                    if (isMounted) {
                        setState({
                            user: currentUser,
                            accessToken,
                            refreshToken,
                            isAuthenticated: true,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    if (isMounted) {
                        logout();
                    }
                }
            } else {
                if (isMounted) {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [logout]);

    const login = useCallback(async (credentials: LoginDTO) => {
        const response = await authService.login(credentials);

        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));

        setState({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false
        });
    }, []);

    const register = useCallback(async (data: RegisterDTO) => {
        const response = await authService.register(data);

        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));

        setState({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false
        });
    }, []);

    const updateUser = useCallback((user: UserDTO) => {
        localStorage.setItem('user', JSON.stringify(user));
        setState(prev => ({ ...prev, user }));
    }, []);

    const changePassword = useCallback(async (data: ChangePasswordDTO) => {
        await authService.changePassword(data);
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};