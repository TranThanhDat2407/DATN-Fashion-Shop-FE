import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { TotalQty } from '../../../dto/TotalQty';
import { CartDTO } from '../../../dto/CartDTO';
import { CreateCartDTO } from '../../../dto/CreateCartDTO';
import { response } from 'express';
import { SessionService } from '../../session/session.service';
import { TokenService } from '../../token/token.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiBaseUrl}/cart`;

  constructor(private http: HttpClient,
              private sessionService: SessionService,
              private tokenService: TokenService
  ) { }


  totalCartSubject = new BehaviorSubject<number>(0);
  totalCart$ = this.totalCartSubject.asObservable();

  getQtyCart(userId: number, sessionId: string): void {
    let params: string = '';

    if (userId !== 0) {
      params = `userId=${encodeURIComponent(userId)}`;
    } else if (sessionId) { // Kiểm tra sessionId hợp lệ khi userId === 0
      params = `sessionId=${encodeURIComponent(sessionId)}`;
    } else {
      console.warn('⚠️ getQtyCart gây lỗi: Cả userId và sessionId đều không hợp lệ!');
      return;
    }

    const apiUrl = `${this.apiUrl}/total?${params}`;
    console.log('🌍 Gọi API:', apiUrl);

    this.http.get<{ status: number; data?: { totalCart: number } }>(apiUrl, { withCredentials: true }).pipe(
      map(response => response.status === 200 && response.data ? response.data.totalCart : 0),
      catchError(error => {
        console.error('❌ Lỗi khi lấy tổng số giỏ hàng:', error);
        return of(0);
      })
    ).subscribe(total => {
      console.log(`🛒 Tổng số lượng giỏ hàng: ${total}`);
      this.totalCartSubject.next(total); // 🟢 Cập nhật giá trị vào BehaviorSubject
    });
  }


  getAllCart(userId: number, sessionId: string): Observable<ApiResponse<CartDTO>> {
    let params: string[] = [];

    console.log('🔍 Kiểm tra userId:', userId, '🔍 SESSION_ID:', sessionId);

    if (userId !== 0) {
      params.push(`userId=${encodeURIComponent(userId)}`);
    } else if (sessionId !== '' && sessionId !== null && sessionId !== undefined) {
      params.push(`sessionId=${encodeURIComponent(sessionId)}`);
    } else {
      console.warn('⚠️ sessionId không hợp lệ, có thể gây lỗi!');
    }

    const queryString = params.length ? `?${params.join('&')}` : '';
    const apiUrl = `${this.apiUrl}${queryString}`;


    return this.http.get<ApiResponse<CartDTO>>(apiUrl, { withCredentials: true });
  }




  createCart(userId: number, sessionId: string, variant: CreateCartDTO): Observable<any> {
    let params: string[] = [];
    let check = false
    console.log("ider: " + userId)
    console.log("ider: " + sessionId)

    if (userId !== null && userId !== undefined && userId !== 0) {
      check = true
      params.push(`userId=${encodeURIComponent(userId)}`);
    }
    if (!check) {
      if (sessionId?.trim()) {
        params.push(`sessionId=${encodeURIComponent(sessionId)}`);
      }
    }
    const queryString = params.length ? `?${params.join('&')}` : '';
    console.log('Request URL:', `${this.apiUrl}${queryString}`);

    return this.http.post<ApiResponse<CartDTO>>(`${this.apiUrl}/add${queryString}`, variant);
  }
  updateQtyCart(userId: number, sessionId: string, cardId: number, newQuantity: number): Observable<any> {
    let params: string[] = [];
    let check = false

    if (userId !== null && userId !== undefined && userId !== 0) {
      check = true
      params.push(`userId=${encodeURIComponent(userId)}`);
    }
    if (!check) {
      if (sessionId?.trim()) {
        params.push(`sessionId=${encodeURIComponent(sessionId)}`);
      }
    }
    const queryString = params.length ? `?${params.join('&')}` : '';
    console.log('Request URL:', `${this.apiUrl}${queryString}`);

    return this.http.put<ApiResponse<CartDTO>>(`${this.apiUrl}/${cardId}${queryString}&newQuantity=${newQuantity}`, {});
  }

  deleteCart(userId: number, sessionId: string, cardId: number): Observable<any> {
    let params: string[] = [];
    let check = false

    if (userId !== null && userId !== undefined && userId !== 0) {
      check = true
      params.push(`userId=${encodeURIComponent(userId)}`);
    }
    if (!check) {
      if (sessionId?.trim()) {
        params.push(`sessionId=${encodeURIComponent(sessionId)}`);
      }
    }
    const queryString = params.length ? `?${params.join('&')}` : '';
    console.log('Request URL:', `${this.apiUrl}${queryString}`);

    return this.http.delete<ApiResponse<CartDTO>>(`${this.apiUrl}/item/${cardId}${queryString}`);
  }


  clearCart(userId: number, sessionId: string): Observable<any> {
    let params: string[] = [];
    let check = false

    if (userId !== null && userId !== undefined && userId !== 0) {
      check = true
      params.push(`userId=${encodeURIComponent(userId)}`);
    }
    if (!check) {
      if (sessionId?.trim()) {
        params.push(`sessionId=${encodeURIComponent(sessionId)}`);
      }
    }
    const queryString = params.length ? `?${params.join('&')}` : '';
    console.log('Request URL:', `${this.apiUrl}${queryString}`);

    return this.http.delete<ApiResponse<CartDTO>>(`${this.apiUrl}/clear${queryString}`);
  }

  mergeCart(userId: number, sessionId: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/merge?sessionId=${sessionId}&userId=${userId}`, {})

  }

  addToCartStaff(userId: number, storeId: number, productVariantId: string, quantity: number): Observable<any> {
    const url = `${this.apiUrl}/staff-add?userId=${userId}&storeId=${storeId}`;
    const requestBody = { productVariantId, quantity };
    return this.http.post(url, requestBody);
  }

  staffUpdateCart(userId: number, storeId: number, request: any): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/staff-update?userId=${userId}&storeId=${storeId}`;
    return this.http.put<ApiResponse<any>>(url, request);
  }

  // API xóa 1 item khỏi giỏ hàng
  removeFromCart(userId: number, sessionId: string, cartItemId: number): Observable<ApiResponse<void>> {
    let params: string[] = [];
    if (userId !== null && userId !== undefined) {
      params.push(`userId=${encodeURIComponent(userId)}`);
    }
    if (sessionId?.trim()) {
      params.push(`sessionId=${encodeURIComponent(sessionId)}`);
    }
    const queryString = params.length ? `?${params.join('&')}` : '';
    const url = `${this.apiUrl}/item/${cartItemId}${queryString}`;
    return this.http.delete<ApiResponse<void>>(url);
  }



}
