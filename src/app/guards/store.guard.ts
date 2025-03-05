import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router'; // Đảm bảo bạn đã import Router ở đây.
import { inject } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { UserResponse} from '../dto/Response/user/user.response';
import { TokenService } from '../services/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class StoreGuard  {
  user_info?:any | null;
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService:UserService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;
    this.user_info = this.userService.getUserInfo()

    const userRole = this.user_info?.roles;
    const isStaff = userRole == 'ROLE_STAFF';
    const isStoreManager = userRole == 'ROLE_STORE_MANAGER';

    if (!isTokenExpired && isUserIdValid && (isStaff || isStoreManager)) {
      return true;
    } else {
      this.router.navigate(['staff/0/login'], {
        queryParams: { error: 'YOU DONT HAVE PERMISSION' },
      });
      return false;
    }
  }
}

export const StoreGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  return inject(StoreGuard).canActivate(next, state);
};
