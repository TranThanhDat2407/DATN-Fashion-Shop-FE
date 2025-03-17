import {BaseResponse} from '../Response/base-response';

export interface StoreOrderDetailResponse extends BaseResponse{
  productImage: string;
  productName: string;
  colorName: string;
  sizeName: string;
  colorImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
