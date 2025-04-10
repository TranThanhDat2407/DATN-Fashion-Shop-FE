import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, tap, throwError} from 'rxjs';
import {OrderAdmin} from '../../../models/OrderAdmin/OrderAdmin';
import {PageResponse} from '../../../dto/Response/page-response';
import {ApiResponse} from '../../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceAdmin {
  private apiUrl = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) { }

  /** 📌 Lấy tất cả đơn hàng */

  getFilteredOrders(
    orderId?: number,
    status?: string,
    shippingAddress?: string,
    minPrice?: number,
    maxPrice?: number,
    fromDate?: string,
    toDate?: string,
    updateFromDate?: string,
    updateToDate?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    storeId?: number
  ): Observable<ApiResponse<PageResponse<OrderAdmin[]>>> {
    let params = new HttpParams();

    if (orderId != null) params = params.set('orderId', orderId.toString());
    if (status?.trim()) params = params.set('status', status.trim());
    if (shippingAddress?.trim()) params = params.set('shippingAddress', shippingAddress.trim());
    if (minPrice != null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice != null) params = params.set('maxPrice', maxPrice.toString());

    if (fromDate) params = params.set('fromDate', fromDate.toString());
    if (toDate) params = params.set('toDate', toDate.toString());

    if (updateFromDate) params = params.set('updateFromDate', updateFromDate.toString());
    if (updateToDate) params = params.set('updateToDate', updateToDate.toString());
    if (storeId) params = params.set('storeId', storeId.toString())

    params = params.set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<ApiResponse<PageResponse<OrderAdmin[]>>>(`${this.apiUrl}/filter`, { params });
  }





  updateOrderStatus(orderId: number, status: string): Observable<ApiResponse<OrderAdmin>> {
    console.log('Sending request:', { orderId, status }); // Log yêu cầu gửi đi

    return this.http.put<ApiResponse<OrderAdmin>>(`${this.apiUrl}/${orderId}/status`, { status }).pipe(
      catchError(error => {
        console.error('Lỗi trong service khi gọi API:', error); // Log lỗi từ API
        return throwError(error);
      })
    );
  }






}
