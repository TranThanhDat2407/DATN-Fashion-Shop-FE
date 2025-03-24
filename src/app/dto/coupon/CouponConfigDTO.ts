export interface CouponConfigDTO {
  discountType: string | null;
  discountValue: number | null;
  minOrderValue: number | null;
  expirationDays: number;
  imageUrl: string | null;
}
