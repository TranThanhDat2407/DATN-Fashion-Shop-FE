import {BaseResponse} from '../../dto/Response/base-response';

export interface OrderHistoryDTO extends BaseResponse{
  orderId: number;
  totalPrice: number;
  totalAmount: number;
  shippingAddress: string;
  orderStatus: string;
  shippingMethodName: string;
  paymentMethodName: string | null;
  shippingFee: number;
  taxAmount: number;
}
