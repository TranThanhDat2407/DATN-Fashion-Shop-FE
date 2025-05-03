export interface OrderAdmin {
  orderId?: number;
  totalPrice: number;
  totalAmount: number;
  orderStatus: string | undefined;
  orderTime: Date;
  shippingAddress: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  checked?: boolean;
}
