import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}
  getSession(): string | undefined {
    return this.getCookie('SESSION_ID') || undefined;
  }


  generateSession(): string {
    if (isPlatformBrowser(this.platformId)) {
      const newSessionId = crypto.randomUUID();
      document.cookie = `SESSION_ID=${newSessionId}; path=/;`;
      return newSessionId;
    }
    return '';
  }

  getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    }
    return null;
  }
}
