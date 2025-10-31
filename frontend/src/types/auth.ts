import { UserDTO } from './user';

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    login: string;
    phoneNumber?: string;
    department?: string;
    position?: string;
}

export interface AuthResponseDTO {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserDTO;
}

export interface RefreshTokenDTO {
    refreshToken: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface AuthState {
    user: UserDTO | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}