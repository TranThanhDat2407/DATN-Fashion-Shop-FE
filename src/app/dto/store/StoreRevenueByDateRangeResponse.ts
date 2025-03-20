import {UserResponse} from '../Response/user/user.response';
import {StoreOrderDetailResponse} from './StoreOrderDetailResponse';
import {StoreOrderStatusResponse} from './StoreOrderStatusResponse';

export interface StoreRevenueByDateRangeResponse {
  month: number;
  year: number;
  totalRevenue: number;
}
