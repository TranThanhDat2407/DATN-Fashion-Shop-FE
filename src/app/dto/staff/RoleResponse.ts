import {BaseResponse} from '../Response/base-response';

export interface RoleResponse extends BaseResponse{
  id: number;
  name: string;
}
