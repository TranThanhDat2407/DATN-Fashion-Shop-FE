import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {StorePaymentRequest} from '../../dto/StorePaymentRequest';
import {Observable} from 'rxjs';
import {StorePaymentResponse} from '../../dto/StorePaymentResponse';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {}

  createStoreOrder(staffId: number, request: StorePaymentRequest): Observable<StorePaymentResponse> {
    return this.http.post<StorePaymentResponse>(`${this.apiUrl}/checkout-store/${staffId}`, request);
  }

}
