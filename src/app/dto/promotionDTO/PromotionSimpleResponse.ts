import {BaseResponse} from '../Response/base-response';

export interface PromotionSimpleResponse extends BaseResponse{
  id: number;
  description: string;
  discountRate: number;
  startDate: string;  // ISO string (yyyy-MM-dd'T'HH:mm:ss)
  endDate: string;    // ISO string (yyyy-MM-dd'T'HH:mm:ss)
  isActive: boolean;
}
