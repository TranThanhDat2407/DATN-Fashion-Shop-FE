export interface StorePaymentResponse  {
  orderId: number;
  userId?: number;
  storeId: number;
  totalPrice: number;
  totalAmount: number;
  taxAmount: number;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  transactionCode: string;
  payUrl?: string;
}
