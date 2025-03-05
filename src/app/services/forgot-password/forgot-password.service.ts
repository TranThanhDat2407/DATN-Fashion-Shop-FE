import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {

  private apiUrl  = `${environment.apiBaseUrl}/users`; // Đảm bảo đường dẫn đúng

  constructor(private http: HttpClient) {}

  // Gửi yêu cầu quên mật khẩu (gửi OTP qua email)
  forgotPassword(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, {}, { params });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, {}, { params });
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}/reset-password-email/${encodeURIComponent(email)}`;

    const params = new HttpParams().set('newPassword', newPassword);

    return this.http.post<any>(url, {}, { params });
  }
}
