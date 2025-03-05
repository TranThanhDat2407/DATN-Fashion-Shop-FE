export interface CheckoutData {
  shippingData: {
    address: string;
    city: string;
    phone: string;
  };
  paymentMethod: string; // "COD", "VNPay", hoặc các phương thức khác
  orderDetails: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
}
