import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {StorePaymentRequest} from '../../dto/StorePaymentRequest';
import {Observable} from 'rxjs';
import {StorePaymentResponse} from '../../dto/StorePaymentResponse';
import {StoreOrderResponse} from '../../dto/store/StoreOrderResponse';
import {PageResponse} from '../../dto/Response/page-response';
import {ApiResponse} from '../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {}

  createStoreOrder(staffId: number, request: StorePaymentRequest): Observable<StorePaymentResponse> {
    return this.http.post<StorePaymentResponse>(`${this.apiUrl}/checkout-store/${staffId}`, request);
  }

  getStoreOrders(
    storeId: number,
    orderStatusId?: number,
    paymentMethodId?: number,
    shippingMethodId?: number,
    customerId?: number,
    staffId?: number,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'updatedAt',
    sortDir: string = 'desc',
    languageCode: string = 'vi'
  ): Observable<ApiResponse<PageResponse<StoreOrderResponse[]>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('languageCode', languageCode);

    if (orderStatusId) params = params.set('orderStatusId', orderStatusId.toString());
    if (paymentMethodId) params = params.set('paymentMethodId', paymentMethodId.toString());
    if (shippingMethodId) params = params.set('shippingMethodId', shippingMethodId.toString());
    if (customerId) params = params.set('customerId', customerId.toString());
    if (staffId) params = params.set('staffId', staffId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<PageResponse<StoreOrderResponse[]>>>(`${this.apiUrl}/store/${storeId}`, { params });
  }

  getStoreOrderDetail(orderId: number, languageCode: string = 'vi'): Observable<ApiResponse<StoreOrderResponse>> {
    return this.http.get<ApiResponse<StoreOrderResponse>>(`${this.apiUrl}/store/order-detail/${orderId}`, {
      params: new HttpParams().set('languageCode', languageCode)
    });
  }

  updateStoreOrderStatus(orderId: number, statusName: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/store/${orderId}/status`, { statusName });
  }

  updateStorePaymentMethod(orderId: number, paymentMethodName: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/store/${orderId}/payment-method`, { paymentMethodName });
  }


}
