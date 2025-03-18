import {UserResponse} from '../Response/user/user.response';
import {StoreOrderDetailResponse} from './StoreOrderDetailResponse';
import {StoreOrderStatusResponse} from './StoreOrderStatusResponse';
import {StoreShippingMethodResponse} from './StoreShippingMethodResponse';
import {StorePaymentMethodResponse} from './StorePaymentMethodResponse';
import {BaseResponse} from '../Response/base-response';
import {StoreCouponResponse} from './StoreCouponResponse';

export interface StoreOrderResponse extends BaseResponse{
  orderId: number;
  totalPrice: number;
  totalAmount: number;
  shippingAddress: string;
  shippingFee: number;
  taxAmount: number;
  transactionId: string;

  orderStatus: StoreOrderStatusResponse;
  user: UserResponse;
  paymentMethod: StorePaymentMethodResponse;
  shippingMethod: StoreShippingMethodResponse;
  coupon: StoreCouponResponse;

  orderDetails: StoreOrderDetailResponse[];


}
