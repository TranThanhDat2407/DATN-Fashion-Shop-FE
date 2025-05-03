import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import { OrderHistoryDTO } from '../../../models/OrderHistory/OrderHistory';
import { environment } from '../../../../environments/environment';




@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private apiUrl = 'http://localhost:8080/api/v1/orders/history';
  private apiUrl_order = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {}


  changePendingOrder(orderId: number) : Observable<any> {
    return this.http.post(`${this.apiUrl_order}/${orderId}/cancel`,{})
  }

  getOrderHistory(userId: number, page: number = 0, size: number = 5): Observable<{
    content: OrderHistoryDTO[];
    totalElements: number
  }> {
    return this.http.get<ApiResponse<{ content: OrderHistoryDTO[], totalElements: number }>>(
      `${this.apiUrl}/${userId}?page=${page}&size=${size}`
    )
      .pipe(
        map(response => {
          return {
            content: response.data.content,
            totalElements: response.data.totalElements
          };
        }),
        catchError(error => {
          console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
          return throwError(() => new Error('Không thể lấy dữ liệu lịch sử đơn hàng.'));
        })
      );
  }


  getOrderHistoryByStatus(status: string, page: number = 0, size: number = 5): Observable<{
    content: OrderHistoryDTO[];
    totalElements: number;
  }> {
    return this.http.get<ApiResponse<{ content: OrderHistoryDTO[], totalElements: number }>>(
      `${this.apiUrl}/status?status=${status}&page=${page}&size=${size}`
    )
      .pipe(
        map(response => {
          return {
            content: response.data.content,
            totalElements: response.data.totalElements
          };
        }),
        catchError(error => {
          console.error('Lỗi khi lấy lịch sử đơn hàng theo trạng thái:', error);
          return throwError(() => new Error('Không thể lấy dữ liệu lịch sử đơn hàng theo trạng thái.'));
        })
      );
  }



}
