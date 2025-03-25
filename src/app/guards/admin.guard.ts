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

    console.log('Guard role:', this.userService.getUserInfo());

    if (!isTokenExpired && isUserIdValid && isAdmin) {
      return true;
    } else {
      // Nếu không authenticated, bạn có thể redirect hoặc trả về một UrlTree khác.
      // Ví dụ trả về trang login:
      this.authService.setReturnUrl(this.router.url);
      this.toast.error("You need administrator rights to access");
      this.router.navigate(['admin/login_admin']);

      return true;
    }
  }
}

export const AdminGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {

  return inject(AdminGuard).canActivate(next, state);
}
