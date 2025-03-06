import {Inject, Injectable} from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {BehaviorSubject} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private jwtHelperService = new JwtHelperService();
  localStorage?: Storage;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }

  //getter/setter
  getToken(): string {

    return this.localStorage?.getItem(this.TOKEN_KEY) ?? '';
  }

  setToken(token: string): void {
    this.localStorage?.setItem(this.TOKEN_KEY, token);
    this.isLoggedInSubject.next(true);
  }

  getUserId(): number {
    let token = this.getToken();
    if (!token) {
      console.log("📌 Đang chạy trong môi trường:", typeof window !== 'undefined' ? "Trình duyệt" : "Server");
      console.log("📜 Token hiện tại:", this.getToken());
      return 0; // Không có token
    }

    let userObject = this.jwtHelperService.decodeToken(token);

    return 'userId' in userObject ? parseInt(userObject['userId']) : 0;
  }


  getUserEmail(): String {
    let token = this.getToken();
    if (!token) {
      console.log("No token found in localStorage");
      return ""; // Không có token
    }

    let userObject = this.jwtHelperService.decodeToken(token);

    return 'email' in userObject ? userObject['email'] : "";
  }

  getUserPhone(): String {
    let token = this.getToken();
    if (!token) {
      console.log("No token found in localStorage");
      return ""; // Không có token
    }

    let userObject = this.jwtHelperService.decodeToken(token);

    return 'phone' in userObject ? userObject['phone'] : "";
  }

  removeToken(): void {
    this.localStorage?.removeItem(this.TOKEN_KEY);
    this.isLoggedInSubject.next(false);
  }

  isTokenExpired(): boolean {
    if (this.getToken() == null) {
      return false;
    }
    return this.jwtHelperService.isTokenExpired(this.getToken()!);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(); // Có token và không hết hạn
  }

  checkLoginStatus(): void {
    this.isLoggedInSubject.next(this.isLoggedIn()); // Cập nhật lại trạng thái đăng nhập
  }
}
