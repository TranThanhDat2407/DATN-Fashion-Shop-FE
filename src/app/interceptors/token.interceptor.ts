import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { TokenService } from '../services/token/token.service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  // Danh sách các URL ngoại lệ mà bạn không muốn thêm token vào.
  private excludedUrls: string[] = ['https://provinces.open-api.vn'];

  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Kiểm tra nếu URL request nằm trong danh sách loại trừ, thì không thêm token.
    const isExcluded = this.excludedUrls.some(url => req.url.startsWith(url));

    const token = this.tokenService.getToken();

    if (token && !isExcluded) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
