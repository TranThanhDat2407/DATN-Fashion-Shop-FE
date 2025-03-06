import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {BehaviorSubject, catchError, map, Observable, of} from 'rxjs';
import {color} from 'chart.js/helpers';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {WishlistDTO} from '../../../dto/wishlistDTO';
import {WishlistTotalResponse} from '../../../dto/WishlistTotalResponse';
import {WishlistCheckResponse} from '../../../dto/WishlistCheckResponse';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl: string = `${environment.apiBaseUrl}/wishlist`;



  constructor(private http: HttpClient) { }

  //Thêm sản phẩm vào wishlist ở trang Product
  toggleWishlistInProduct(userId: number, variantId: number): Observable<ApiResponse<WishlistDTO>> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('variantId', variantId.toString());

    return this.http.post<ApiResponse<WishlistDTO>>(`${this.apiUrl}/toggle`, {}, { params });
  }

  //Thêm sản phẩm vào wishlist ở trang ProductDetail
  toggleWishlistInProductDetail(userId: number, productId: number, colorId: number): Observable<ApiResponse<WishlistDTO>> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId.toString())
      .set('colorId', colorId.toString());

    return this.http.post<ApiResponse<WishlistDTO>>(`${this.apiUrl}/toggle-by-product-color`, null, { params });
  }

  //Lấy danh sách sản phẩm trong wishlist
  getUserWishlist(userId: number): Observable<ApiResponse<WishlistDTO[]>> {
    return this.http.get<ApiResponse<WishlistDTO[]>>(`${this.apiUrl}/${userId}`);
  }




  private totalWishlistSubject = new BehaviorSubject<number>(0);
  totalWishlist$ = this.totalWishlistSubject.asObservable();

  //Lấy tổng số sản phẩm trong wishlist
  getWishlistTotal(userId: number): void {
    this.http.get<ApiResponse<WishlistTotalResponse>>(`${this.apiUrl}/total/${userId}`)
      .pipe(
        map(response => {
          if (response.status === 200 && response.data) {
            return response.data.totalWishlist;
          } else {
            console.warn('Không có dữ liệu hợp lệ từ API:', response);
            return 0; // Nếu response không hợp lệ, gán giá trị mặc định là 0
          }
        }),
        catchError(error => {
          console.error('Lỗi khi lấy tổng số wishlist:', error);
          return of(0); // Nếu có lỗi, gán giá trị mặc định là 0 để tránh crash
        })
      )
      .subscribe(total => {
        this.totalWishlistSubject.next(total);
      });
  }

  isInWishlist(userId: number, productId: number, colorId: number): Observable<ApiResponse<WishlistCheckResponse>> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId.toString())
      .set('colorId', colorId.toString());

    return this.http.get<ApiResponse<WishlistCheckResponse>>(`${this.apiUrl}/check`, { params }).pipe( // ✅ Log toàn bộ API response để debug
      catchError(error => {
        console.error('Lỗi khi kiểm tra wishlist:', error);
        return of({
          timestamp: new Date().toISOString(),
          status: 500,
          message: 'Lỗi kết nối đến server',
          data: { isInWishList: false }, // ✅ Nếu lỗi, trả về giá trị mặc định hợp lệ
          errors: null
        });
      })
    );
  }
}
