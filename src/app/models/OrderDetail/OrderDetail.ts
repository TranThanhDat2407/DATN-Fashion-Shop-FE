import {ProductsTranslation} from '../Product/ProductsTranslation';
import {ProductVariant} from '../ProductVariant/ProductVariant';


export interface OrderDetail {
  orderDetailId: number;
  orderId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productTranslationResponse?: ProductsTranslation;
  productVariant?: ProductVariant;
  imageUrl: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  tax: number;
  shippingFee: number;
  grandTotal: number;
}
