const EXACT_MATCHES: Record<string, string> = {
    // Auth and register
    "Email already registered": "Этот Email зарегистрирован",
    "Login already taken": "Этот логин занят",
    "Invalid credentials": "Неверный логин или пароль",
    "User not found": "Пользователь не найден",
    "User account isn't active": "Учетная запись деактивирована",
    "User account is locked": "Учетная запись заблокирована",
    "Invalid refresh token": "Сессия истекла. Пожалуйста, войдите снова",
    "Passwords don't match": "Пароли не совпадают",
    "Current password incorrect": "Текущий пароль введен неверно",

    // User
    "Email already exists": "Этот Email зарегистрирован",
    "Login already exists": "Этот логин занят",

    // Security
    "Access token has expired": "Сессия истекла. Пожалуйста, войдите снова",
    "Invalid access token": "Сессия истекла. Пожалуйста, войдите снова",
    "You don't have permission to access this resource": "У вас недостаточно прав",
    "Access Denied": "Доступ запрещен",
};

const PARTIAL_MATCHES: Record<string, string> = {
    "User not found with": "Пользователь не найден",
    "Ticket not found with": "Тикет не найден",
    "No tickets found for assignee": "Тикеты не найдены",

    // Default spring errors
    "must not be null": "Проверьте правильность заполнения полей",
    "must not be empty": "Проверьте правильность заполнения полей",
    "must not be blank": "Проверьте правильность заполнения полей",
    "must be a well-formed email address": "Некорректный формат Email",
    "size must be between": "Проверьте правильность заполнения полей",
};

const HTTP_CODE_MESSAGES: Record<number, string> = {
    400: "Проверьте правильность заполнения полей",
    401: "Ошибка авторизации",
    403: "Доступ запрещен",
    404: "Этой страницы не существует",
    500: "Внутренняя ошибка сервера",
    502: "Сервер временно недоступен"
};

export const getErrorMessage = (error: any): string => {
    // Network errors
    if (!error.response) {
        if (error.code === 'ERR_NETWORK') return "Сервер временно недоступен";
        if (error.code === 'ECONNABORTED') return "Превышено время ожидания";
        return "Произошла ошибка сети";
    }

    const status = error.response.status;
    const backendMessage = error.response.data?.message;

    // Looking for an exact match
    if (backendMessage && EXACT_MATCHES[backendMessage]) return EXACT_MATCHES[backendMessage];
    // If didn't - looking for a partial match
    if (backendMessage) {
        for (const [key, value] of Object.entries(PARTIAL_MATCHES)) {
            if (backendMessage.includes(key)) return value;
        }
    }
    // If didn't again - looking for HTTP code message
    if (HTTP_CODE_MESSAGES[status]) return HTTP_CODE_MESSAGES[status];
    // If nothing worked - fallback to default message
    return "Произошла непредвиденная ошибка";
};