import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router'; // Đảm bảo bạn đã import Router ở đây.
import { inject } from '@angular/core';
import { UserService } from '../services/user/user.service';
import { UserResponse} from '../dto/Response/user/user.response';
import { TokenService } from '../services/token/token.service';
import {StaffService} from '../services/staff/staff.service';
import {catchError, map, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreGuard  {
  user_info?:any | null;
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService:UserService,
    private staffService:StaffService
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;


    if (isTokenExpired || !isUserIdValid) {
      return of(this.router.createUrlTree(['staff/0/login'], {
        queryParams: { error: 'YOU DONT HAVE PERMISSION' },
      }));
    }

    const userId = this.tokenService.getUserId();
    const storeId = Number(next.paramMap.get('storeId'));

    this.user_info = this.userService.getUserInfo();
    const userRole = this.user_info?.roles;
    const isStaff = userRole?.includes('ROLE_STAFF') ?? false;
    const isStoreManager = userRole?.includes('ROLE_STORE_MANAGER') ?? false;



    return this.staffService.checkUserInStore(userId, storeId).pipe(
      map(isInStore => {
        if (storeId === 0) {
          return true;
        }

        if (isInStore && (isStaff || isStoreManager)) {
          return true;
        } else {
          return this.router.createUrlTree(['staff/0/login'], {
            queryParams: { error: 'YOU DONT HAVE PERMISSION' },
          });
        }
      })
    );
  }

}
export const StoreGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  return inject(StoreGuard).canActivate(next, state);
};
