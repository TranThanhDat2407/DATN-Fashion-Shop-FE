import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isUserLoggedIn = new BehaviorSubject<boolean>(false);
  isUserLoggedIn$ = this.isUserLoggedIn.asObservable();
  private returnUrl: string = '/';

  constructor() {}

  setLoginStatus(status: boolean) {
    this.isUserLoggedIn.next(status);
  }

  setReturnUrl(url: string) {
    this.returnUrl = url;
  }

  getReturnUrl(): string {
    return this.returnUrl;
  }
}
