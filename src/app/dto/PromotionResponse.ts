import {BaseResponse} from './Response/base-response';

export interface PromotionResponse extends BaseResponse {
  id: number;
  description: string;
  discountRate: number;
  startDate: string;  // LocalDateTime ở dạng chuỗi ISO 8601
  endDate: string;
  isActive: boolean;
  productIds: number[];
}
