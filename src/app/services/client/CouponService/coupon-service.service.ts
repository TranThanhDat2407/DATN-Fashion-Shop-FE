import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CouponLocalizedDTO } from '../../../dto/coupon/CouponClientDTO';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import {CouponConfigDTO} from '../../../dto/coupon/CouponConfigDTO';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private couponDTO: CouponLocalizedDTO | null = null;
  private CouponConfigDTO: CouponConfigDTO | null = null;
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
    page: number ,
    size: number ,
    sortBy: string = 'createdAt',
    sortDirection: string = 'asc',
  userId?: number,
    expirationDate?: string
  ): Observable<ApiResponse<any>> {
    let params: any = { page, size, sortBy, sortDirection };

    if (keyword && keyword.trim() !== '') {
      params.code = keyword.trim();
    }
    if (userId) {
      params.userId = userId; // Thêm userId vào request nếu có
    }
    if (expirationDate) {
      params.expirationDate = expirationDate;
    }
      return this.http.get<ApiResponse<any>>(`${this.apiUrl}/search`, { params });
  }
  updateAutoCouponConfig(
    type: string,
    request: FormData
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/generate-coupon?type=${type}`,
      request
    );
  }

  createCoupon(type: string, couponData: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('type', type); // Chỉ giữ type ở đây
    formData.append('request', new Blob([JSON.stringify(couponData)], { type: 'application/json' }));

    if (file) {
      formData.append('image', file);
    }


    if (file) {
      console.log('🔹 File đính kèm:', file.name);
    }

    return this.http.post(`${this.apiUrl}/generate-coupon`, formData); // Bỏ `?type=${type}`
  }



  // getCouponConfigs(): Observable<{ [key: string]: CouponConfigDTO }> {
  //   return this.http.get<{ [key: string]: CouponConfigDTO }>(`${this.apiUrl}/coupon-configs`);
  // }


  resetCoupon(couponKey: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/coupon-configs/${couponKey}`, {}, { responseType: 'text' });
  }

  getValidCouponConfigs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/coupon-configs/valid`);  // Đảm bảo API này trỏ đúng đến controller backend
  }

}


