import { ApplicationConfig, Provider, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';


import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';

// Tạo TranslateHttpLoader
const tokenInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
};
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    // provideHttpClient(),
    tokenInterceptorProvider,
    provideAnimations(),
    provideToastr(), // Toastr providers
    // provideRouter(routes),
    provideAnimations(),
    MatNativeDateModule,
    { provide: MAT_DATE_LOCALE, useValue: 'vi' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }).providers!, provideAnimationsAsync(), provideAnimationsAsync(),
  ]
};


