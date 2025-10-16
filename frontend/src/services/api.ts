import axios from 'axios';

const getApiUrl = () => {
    if (import.meta.env.DEV) {
        return 'http://localhost:8080/api';
    }
    return '/api';
};

const api = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api