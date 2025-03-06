import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateFn
} from '@angular/router';
import { TokenService } from '../services/token/token.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationService } from '../services/Navigation/navigation.service';
import { ModalService } from '../services/Modal/modal.service';
import {AuthService} from '../services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  currentLang: string = '';
  currentCurrency: string = '';

  private isModalOpened = false; // Biến kiểm soát mở modal

  constructor(
    private tokenService: TokenService,
    private navigationService: NavigationService,
    private modalService: ModalService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    // Lắng nghe khi modal đóng để reset trạng thái
    this.modalService.modalLoginState$.subscribe(isOpen => {
      if (!isOpen) {
        this.isModalOpened = false; // Reset khi modal đóng
      }
    });
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;

    if (isPlatformBrowser(this.platformId)) {
      if (!isTokenExpired && isUserIdValid) {
        return true;
      } else {

        // Lưu trang hiện tại để quay lại sau khi đăng nhập
        this.authService.setReturnUrl(this.router.url);
        console.log(`URL: ${this.authService.getReturnUrl()}`)
        // Mở modal login nhưng không block route
        setTimeout(() => {
          this.modalService.openLoginModal();
        }, 0);

        return false; // Không chặn route nữa!
      }
    }
    return false;
  }
}

// Functional Guard
export const AuthGuardFn: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(AuthGuard).canActivate(next, state);
};
