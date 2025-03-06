export interface LoginResponse {
    tokenType: string;
    id: number;
    username: string;
    roles: string[];
    message: string;
    token: string;
    refresh_token: string;
}
