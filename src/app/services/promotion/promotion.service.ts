import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {PromotionResponse} from '../../dto/PromotionResponse';
import {ApiResponse} from '../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  private apiUrl = "http://localhost:8080/api/v1/promotions"; // URL của backend

  constructor(private http: HttpClient) {}

  // Hàm gọi API lấy promotion đang active
  getActivePromotion(): Observable<PromotionResponse> {
    return this.http.get<ApiResponse<PromotionResponse>>(`${this.apiUrl}/active`).pipe(
      map((response: ApiResponse<PromotionResponse>) => response.data) // Không chuyển đổi Date
    );
  }

}
