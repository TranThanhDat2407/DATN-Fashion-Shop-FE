import {BaseResponse} from '../Response/base-response';

export interface StaffResponse extends BaseResponse{
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: RoleResponse;
  storeId: number;
}
