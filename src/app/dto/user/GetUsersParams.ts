export interface GetUsersParams {
  page?: number;
  size?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  isActive?: boolean;
  startDate?: string; // ISO string e.g., '2024-01-01T00:00:00'
  endDate?: string;
  roleId?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
