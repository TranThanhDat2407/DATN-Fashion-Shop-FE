import {UserResponse} from '../Response/user/user.response';
import {StoreOrderDetailResponse} from './StoreOrderDetailResponse';
import {StoreOrderStatusResponse} from './StoreOrderStatusResponse';

export interface StorePaymentMethodResponse  {
  id: number;
  methodName: string;
}
