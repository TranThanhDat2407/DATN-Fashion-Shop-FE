import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {OrderDetailResponse} from '../../../models/OrderDetail/OrderDetailResponse';
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
 }
