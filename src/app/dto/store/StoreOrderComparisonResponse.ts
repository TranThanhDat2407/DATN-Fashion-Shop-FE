import {UserResponse} from '../Response/user/user.response';
import {StoreOrderDetailResponse} from './StoreOrderDetailResponse';
import {StoreOrderStatusResponse} from './StoreOrderStatusResponse';

export interface StoreOrderComparisonResponse {
  customerOrder: number;
  guessOrder: number;
}
