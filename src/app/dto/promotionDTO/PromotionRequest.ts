export interface PromotionRequest {
  description: string;
  discountRate: number;
  startDate: string;  // ISO string (yyyy-MM-dd'T'HH:mm:ss)
  endDate: string;    // ISO string (yyyy-MM-dd'T'HH:mm:ss)
  productIds: number[];
}
