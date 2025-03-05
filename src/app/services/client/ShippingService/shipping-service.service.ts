import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CartDTO} from '../../../dto/CartDTO';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private apiUrl = 'http://localhost:8080/api/v1/ghn/calculate';

  constructor(private http: HttpClient) { }

  calculateShippingFee(address: any, cartData: CartDTO | null): Observable<number> {
    console.log("📤 Gửi request tính phí vận chuyển với địa chỉ ShippingService:", address);


    const requestBody = {
      address,
      cartItems: cartData?.cartItems ?? []
    };

    return this.http.post<number>(this.apiUrl, requestBody);
  }

}
