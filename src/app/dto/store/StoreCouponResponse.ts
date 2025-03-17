import {UserResponse} from '../Response/user/user.response';
import {StoreOrderDetailResponse} from './StoreOrderDetailResponse';
import {StoreOrderStatusResponse} from './StoreOrderStatusResponse';
import {StoreShippingMethodResponse} from './StoreShippingMethodResponse';
import {StorePaymentMethodResponse} from './StorePaymentMethodResponse';
import {BaseResponse} from '../Response/base-response';

export interface StoreCouponResponse extends BaseResponse{
  id: number;
  discountType: string;
  discountValue: number;
  code: string;
}
