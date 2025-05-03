import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router'; // Đảm bảo bạn đã import Router ở đây.
import { inject } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { UserResponse} from '../dto/Response/user/user.response';
import { TokenService } from '../services/token/token.service';
import {Toast, ToastrService} from 'ngx-toastr';
import {AuthService} from '../services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  user_info?:any | null;
  userResponse?:UserResponse | null;
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService:UserService,
    private toast : ToastrService,
    private authService: AuthService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    this.user_info = this.userService.getUserInfo();
    const userRole = this.user_info?.roles;
    const isAdmin = userRole?.includes('ROLE_ADMIN') ?? false;

    // ✅ Trường hợp được phép truy cập
    if (!isTokenExpired && isUserIdValid && isAdmin) {
      return true;
    }

    // ❌ Không đủ quyền - chặn và thông báo
    this.authService.setReturnUrl(this.router.url);

    // ✅ Chuyển hướng về trang login
    this.router.navigate(['admin/login_admin']);

    return false; // ❗ Quan trọng: chặn truy cập
  }

}

export const AdminGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  return inject(AdminGuard).canActivate(next, state);
}
