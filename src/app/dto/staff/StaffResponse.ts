import {BaseResponse} from '../Response/base-response';
import {RoleResponse} from './RoleResponse';
import {StoreDetailDTO} from '../StoreDetailDTO';

export interface StaffResponse extends BaseResponse{
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  gender: string;
  store: StoreDetailDTO;
  role: RoleResponse;
  storeId: number;
}
