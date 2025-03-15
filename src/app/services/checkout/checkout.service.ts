import { Injectable } from '@angular/core';
import {CheckoutData} from '../../models/checkout/checkoutData';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {AddressDTO} from '../../dto/address/AddressDTO';
import {HttpClient} from '@angular/common/http';
import {ApiResponse} from '../../dto/Response/ApiResponse';
import {ClickAndCollectOrderRequest} from '../../dto/ClickAndCollectOrderRequest';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  private shippingInfo = new BehaviorSubject<any>(null);

  paymentInfo = new BehaviorSubject<any>({ paymentMethodId: 1 });
  private orderReview = new BehaviorSubject<any>(null);
  private cartData = new BehaviorSubject<any>(null);

  shippingInfo$ = this.shippingInfo.asObservable();
  orderData$ = this.orderReview.asObservable();

  constructor(private http: HttpClient) {}

  setShippingFee(shippingInfo: any): void {
    this.shippingInfo.next(shippingInfo);
  }

  setPaymentInfo(data: any) {
    this.paymentInfo.next(data);
    console.log("Đã cập nhật paymentInfo:", this.paymentInfo.value);
  }

  setCartData(data: any) {
    this.cartData.next(data);
  }

  setOrderData(data: any) {
    this.orderReview.next(data);
  }

  getOrderData() {
    return this.orderReview.value;
  }


  getCheckoutData() {
    console.log("Dữ liệu paymentInfo hiện tại:", this.paymentInfo.value);

    return {
      userId: this.cartData.value?.userId ?? null,
      cartId: this.cartData.value?.id ?? null,
      couponId: this.cartData.value?.couponId ?? null,
      shippingMethodId: this.shippingInfo.value?.shippingMethodId ?? null,
      shippingAddress: this.shippingInfo.value?.addressId ?? null,
      paymentMethodId: this.paymentInfo.value?.paymentMethodId
        ? this.paymentInfo.value.paymentMethodId
        : null,
      receiverName: this.shippingInfo.value?.receiverName ?? '',
      receiverPhone: this.shippingInfo.value?.receiverPhone ?? '',
      shippingFee: this.shippingInfo.value?.shippingFee ?? 0
    };
  }

  placeOrder(orderRequest: any): Observable<any> {
    return this.http.post<ApiResponse<any>>('http://localhost:8080/api/v1/orders/create-order', orderRequest) .pipe(
      map((response: ApiResponse<any>) => {
        if (response.status && response.data) {
          return {
            orderId: response.data.orderId,
            paymentUrl: response.data.paymentUrl || null
          };
        } else {
          throw new Error(response.message || 'Không thể tạo đơn hàng.');
        }
      })
    );
  }

  // getClickAndCollectCheckoutData(): ClickAndCollectOrderRequest {
  //   if (!this.cartData.value?.userId) {
  //     throw new Error("Không tìm thấy userId!");
  //   }
  //
  //   if (!this.shippingInfo.value?.storeId) {
  //     throw new Error("Vui lòng chọn cửa hàng để nhận hàng!");
  //   }
  //
  //   if (!this.paymentInfo.value?.paymentMethodId) {
  //     throw new Error("Vui lòng chọn phương thức thanh toán!");
  //   }
  //
  //   const checkoutData: ClickAndCollectOrderRequest = {
  //     userId: this.cartData.value.userId,
  //     storeId: this.shippingInfo.value.storeId,
  //     couponId: this.cartData.value?.couponId ?? null,
  //     paymentMethodId: this.paymentInfo.value.paymentMethodId
  //   };
  //
  //   console.log("✅ Click & Collect Checkout Data:", checkoutData);
  //   return checkoutData;
  // }
  //
  //
  // placeClickAndCollectOrder(): Observable<any> {
  //   try {
  //     const orderData = this.getClickAndCollectCheckoutData();
  //
  //     return this.http.post<ApiResponse<any>>(`${this.apiUrl}/create-click-and-collect-order`, orderData).pipe(
  //       map((response: ApiResponse<any>) => {
  //         if (response.status && response.data) {
  //           return {
  //             orderId: response.data.orderId,
  //             paymentUrl: response.data.paymentUrl || null
  //           };
  //         } else {
  //           throw new Error(response.message || 'Không thể tạo đơn hàng Click & Collect.');
  //         }
  //       })
  //     );
  //   } catch (error) {
  //     console.error("❌ Lỗi khi tạo đơn hàng Click & Collect:", error);
  //     throw error;
  //   }
  // }

}
