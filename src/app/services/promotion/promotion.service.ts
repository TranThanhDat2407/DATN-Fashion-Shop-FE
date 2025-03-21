import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {PromotionResponse} from '../../dto/PromotionResponse';
import {ApiResponse} from '../../dto/Response/ApiResponse';
import {PageResponse} from '../../dto/Response/page-response';
import {PromotionSimpleResponse} from '../../dto/promotionDTO/PromotionSimpleResponse';
import {PromotionRequest} from '../../dto/promotionDTO/PromotionRequest';

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

  getAllPromotions(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string
  ): Observable<ApiResponse<PageResponse<PromotionSimpleResponse[]>>> {

    // Thiết lập các tham số cho yêu cầu
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    // Gửi yêu cầu GET đến API
    return this.http.get<ApiResponse<PageResponse<PromotionSimpleResponse[]>>>(`${this.apiUrl}`, { params });
  }

  // 1. GET promotion by promotionId
  getPromotionById(promotionId: number): Observable<ApiResponse<PromotionSimpleResponse>> {
    return this.http.get<ApiResponse<PromotionResponse>>(`${this.apiUrl}/${promotionId}`);
  }

  // 2. GET productIds for a specific promotion
  getProductIdsByPromotionId(promotionId: number): Observable<ApiResponse<number[]>> {
    return this.http.get<ApiResponse<number[]>>(`${this.apiUrl}/${promotionId}/product-ids`);
  }

  // 3. POST to create a new promotion
  createPromotion(request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    return this.http.post<ApiResponse<PromotionResponse>>(`${this.apiUrl}/create`, request);
  }

  // 4. PUT to update promotion by promotionId
  updatePromotion(promotionId: number, request: PromotionRequest): Observable<ApiResponse<PromotionResponse>> {
    return this.http.put<ApiResponse<PromotionResponse>>(`${this.apiUrl}/${promotionId}`, request);
  }

  // 5. DELETE promotion by promotionId
  deletePromotion(promotionId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${promotionId}`);
  }

  // 6. DELETE product from a promotion
  removeProductFromPromotion(promotionId: number, productId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${promotionId}/products/${productId}`);
  }

  // 7. DELETE all products from a promotion
  removeAllProductsFromPromotion(promotionId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${promotionId}/remove-all-products`);
  }

}
