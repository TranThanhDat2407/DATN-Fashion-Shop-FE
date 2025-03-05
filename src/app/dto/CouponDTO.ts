import { CartItemDTO } from "./CartItemDTO"

export interface CouponDTO {
  id: number;
  discountValue: number;
  code: string;
  minOrderValue: number;
  discountType: string;
  expirationDate: string;
}
