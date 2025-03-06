import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RevenueToday } from '../../../dto/admin/RevenueToday';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { OrderToday } from '../../../dto/admin/OrderToday';
import { OrderCancel } from '../../../dto/admin/OrderCancel';
import { CustomerAccoutToday } from '../../../dto/admin/CustomerAccoutToday';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  constructor(private http: HttpClient) { }

  private apiUrlOrder = `${environment.apiBaseUrl}/orders`
  private apiUrlUser = `${environment.apiBaseUrl}/users`


  getRevenueToday(): Observable<ApiResponse<RevenueToday>> {
    return this.http.get<ApiResponse<RevenueToday>>(`${this.apiUrlOrder}/revenue/today`)
  }

  getRevenueYesterday(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrlOrder}/revenue/yesterday`)
  }

  getOrderToday(): Observable<ApiResponse<OrderToday>> {
    return this.http.get<ApiResponse<OrderToday>>(`${this.apiUrlOrder}/orderTotal/today`)
  }

  getOrderYesterday(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrlOrder}/orderTotal/yesterday`)
  }
  
  getOrderCancelToday(): Observable<ApiResponse<OrderCancel>> {
    return this.http.get<ApiResponse<OrderCancel>>(`${this.apiUrlOrder}/orderCancelTotal/today`)
  }
  getOrderCancelYesterday(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrlOrder}/orderCancelTotal/yesterday`)
  }

  getCustomerAccountToday(): Observable<ApiResponse<CustomerAccoutToday>> {
    return this.http.get<ApiResponse<CustomerAccoutToday>>(`${this.apiUrlUser}/cutomerCreate/today`)
  }
  getCustomerAccountYesterday(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrlUser}/cutomerCreate/yesterday`)
  }







  
}
