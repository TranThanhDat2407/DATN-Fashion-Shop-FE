import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OrderDetailResponse} from '../../../models/OrderDetail/OrderDetailResponse';
import {OrderDetailAdminResponse} from '../../../models/OrderDetail/OrderDetailAdminResponse';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {PageResponse} from '../../../dto/Response/page-response';
// import {OrderDetailResponse} from '../../../dto/Response/orderDetail/OrderDetailResponse';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {
  private apiUrl = 'http://localhost:8080/api/v1/order-details';

  constructor(private http: HttpClient) {}

  getOrderDetails(orderId: number): Observable<OrderDetailResponse> {
    return this.http.get<OrderDetailResponse>(`${this.apiUrl}/${orderId}`);
  }


  getOrderDetailsAdmin(orderId: number): Observable<ApiResponse<OrderDetailAdminResponse[]>> {
    return this.http.get<ApiResponse<OrderDetailAdminResponse[]>> (`${this.apiUrl}/admin/${orderId}`);
  }



}
