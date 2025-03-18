import { Role } from '../../../models/role';

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  facebook_account_id: number;
  google_account_id: number;
  role: Role;
  isActive: boolean;
}
