import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {CouponDTO} from '../../../dto/CouponDTO';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl: string = `${environment.apiBaseUrl}/coupons`;

  constructor(private http: HttpClient) { }

  getCouponById(couponId: number): Observable<CouponDTO> {
    return this.http.get<ApiResponse<CouponDTO>>(`${this.apiUrl}/${couponId}`)
      .pipe(map(response => response.data));
  }

  getCouponByCode(code: string): Observable<CouponDTO> {
    return this.http.get<ApiResponse<CouponDTO>>(`${this.apiUrl}/code/${code}`)
      .pipe(map(response => response.data));
  }

  validateCouponUser(userId: number, couponId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>
    (`${this.apiUrl}/validate/coupon-user?userId=${userId}&couponId=${couponId}`)
      .pipe(map(response => response.data));
  }
}
