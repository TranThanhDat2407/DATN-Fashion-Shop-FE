import {BaseResponse} from '../Response/base-response';

export interface UserAdminResponse extends BaseResponse{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string; // Định dạng ISO "yyyy-MM-dd'T'HH:mm:ss"
  role: Role;
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
}
