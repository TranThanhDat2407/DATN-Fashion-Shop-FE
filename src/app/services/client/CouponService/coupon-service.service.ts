import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CouponLocalizedDTO } from '../../../dto/coupon/CouponClientDTO';
import { ApiResponse } from '../../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private couponDTO: CouponLocalizedDTO | null = null;

  private apiUrl = `${environment.apiBaseUrl}/coupons`; // 🔥 Cập nhật đường dẫn API đúng

  constructor(private http: HttpClient) { }

  getCouponsForUser(userId: number, languageCode: string): Observable<ApiResponse<CouponLocalizedDTO[]>> {
    return this.http.get<ApiResponse<CouponLocalizedDTO[]>>(
      `${this.apiUrl}/user/${userId}?languageCode=${languageCode}`
    );
  }
  setCouponDTO(couponDTO: CouponLocalizedDTO): void {
    this.couponDTO = couponDTO;
  }

  // Lấy thông tin mã giảm giá đã lưu
  getCouponDTO(): CouponLocalizedDTO | null {
    return this.couponDTO;
  }

  searchCoupons(
    keyword: string | null,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'asc'
  ): Observable<ApiResponse<any>> {
    let params: any = { keyword, page, size, sortBy, sortDirection };
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/search`, { params });
  }


  // applyCoupon(userId: number, requestBody: { code: string }): Observable<ApiResponse<boolean>> {
  //   return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}apply?userId=${userId}`, requestBody);
  // }

}
