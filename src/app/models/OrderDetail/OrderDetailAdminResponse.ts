import {ProductVariant} from '../ProductVariant/ProductVariant';

export interface OrderDetailAdminResponse {
  orderDetailId: number;
  orderId: number ;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariant?: ProductVariant;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createTime: string;
  updateTime: string;
  couponPrice: number;
  storeName: string;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  imageUrl: string;
}
