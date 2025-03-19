import {UserResponse} from '../Response/user/user.response';
import {StoreOrderDetailResponse} from './StoreOrderDetailResponse';
import {StoreOrderStatusResponse} from './StoreOrderStatusResponse';

export interface StoreDailyRevenueResponse {
  day: number;
  month: number;
  year: number;
  totalRevenue: number;
}
