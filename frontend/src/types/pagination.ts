export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: 'created_at' | 'updated_at' | 'priority';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}