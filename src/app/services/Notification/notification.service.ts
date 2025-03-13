import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {BehaviorSubject, catchError, map, Observable, of} from 'rxjs';
import {ApiResponse} from '../../dto/Response/ApiResponse';
import {NotificationDTO} from '../../models/NotificationDTO';
import {PageResponse} from '../../dto/Response/page-response';
import {WishlistTotalResponse} from '../../dto/WishlistTotalResponse';
import {TotalNotificationResponse} from '../../dto/TotalNotificationResponse';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl: string = `${environment.apiBaseUrl}/notify`;



  constructor(private http: HttpClient) { }

  getUserNotifications(
    userId: number,
    langCode: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: 'asc' | 'desc' = 'asc'
  ): Observable<ApiResponse<PageResponse<NotificationDTO>>> {
    let params = new HttpParams()
      .set('langCode', langCode)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<ApiResponse<PageResponse<NotificationDTO>>>(`${this.apiUrl}/${userId}`, { params });
  }

  private totalNotifySubject = new BehaviorSubject<number>(0);
  totalNotify$ = this.totalNotifySubject.asObservable();

  //Lấy tổng số sản phẩm trong wishlist
  getNotifyTotal(userId: number): void {
    this.http.get<ApiResponse<TotalNotificationResponse>>(`${this.apiUrl}/total/${userId}`)
      .pipe(
        map(response => {
          if (response.status === 200 && response.data) {
            return response.data.totalNotify;
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
        this.totalNotifySubject.next(total);
      });
  }

  /**
   * Đánh dấu tất cả thông báo của user là đã đọc
   */
  markAllAsRead(userId: number): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/mark-all-read/${userId}`, {});
  }

  /**
   * Xóa một thông báo theo ID
   */
  deleteNotificationById(notificationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/delete/${notificationId}`);
  }


  /**
   * Xóa tất cả thông báo của user theo userId
   */
  deleteNotificationsByUserId(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/delete/user/${userId}`);
  }

}
