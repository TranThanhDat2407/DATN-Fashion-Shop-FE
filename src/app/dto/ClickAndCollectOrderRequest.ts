import { CartItemDTO } from "./CartItemDTO"

export interface ClickAndCollectOrderRequest {
  userId: number;
  storeId: number;
  couponId?: number | null;
  paymentMethodId: number;
}
