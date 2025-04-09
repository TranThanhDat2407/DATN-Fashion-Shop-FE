export interface StorePaymentRequest  {
  userId: number | null;
  storeId: number;
  couponId?: number | null;
  paymentMethodId: number;
  totalPrice: number;
  totalAmount: number;
  taxAmount: number;
  transactionCode: string | null;
  payUrl?: string;
}
