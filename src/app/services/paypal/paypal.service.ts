import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private API_BASE = "http://localhost:8080/api/v1/paypal";
  constructor(private http: HttpClient) {}

  createOrder(amount: number) {
    const params = new HttpParams().set('amount', amount.toString());
    return this.http.post(this.API_BASE + '/create-order', null, {
      params,
      responseType: 'text'
    });
  }

  captureOrder(token: string) {
    return this.http.post('http://localhost:8080/api/v1/paypal/capture-order', null, {
      params: { token },
      responseType: 'text'
    });
  }


}
