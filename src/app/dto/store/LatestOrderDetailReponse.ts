import {UserResponse} from '../Response/user/user.response';
import {BaseResponse} from '../Response/base-response';


export interface LatestOrderDetailResponse extends BaseResponse {
  orderId: number;
  user?: UserResponse;
  productImage: string;
  productName: string;
  colorName: string;
  sizeName: string;
  colorImage: string;
  status: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
