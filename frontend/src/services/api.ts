import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from './env';

const getApiUrl = () => {
    return env.apiUrl;
};

const api = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Refresh token queue
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let failedQueue: ((error?: Error) => void)[] = [];

const subscribeRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (newToken: string) => {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
};

const onRefreshFailed = (error: Error) => {
    failedQueue.forEach(callback => callback(error));
    failedQueue = [];
    refreshSubscribers = [];
};

// Centralized logout
const triggerLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Event for AuthContext
    window.dispatchEvent(new CustomEvent('auth:logout'));

    // Fallback redirect
    setTimeout(() => {
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }, 100);
};

// Request interceptor
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Don't touch non-401 errors
        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // If already tried - don't repeat
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // If request returned 401 - logout
        if (originalRequest.url?.includes('/auth/refresh')) {
            triggerLogout();
            return Promise.reject(error);
        }

        // If refresh is in progress - wait for result
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeRefresh((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
                failedQueue.push((err) => {
                    reject(err || error);
                });
            });
        }

        // Start refresh
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            isRefreshing = false;
            triggerLogout();
            return Promise.reject(error);
        }

        try {
            const response = await api.post('/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', newRefreshToken);

            // Notify
            onRefreshed(accessToken);

            // Repeat original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);

        } catch (refreshError) {
            onRefreshFailed(refreshError as Error);
            triggerLogout();
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default api