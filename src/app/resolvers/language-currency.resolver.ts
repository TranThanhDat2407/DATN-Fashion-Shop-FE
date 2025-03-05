import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { NavigationService} from '../services/Navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageCurrencyResolver implements Resolve<void> {
  constructor(private navigationService: NavigationService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    const currency = route.paramMap.get('currency') || 'vn'; // Lấy currency từ URL
    const lang = route.paramMap.get('lang') || 'vi'; // Lấy lang từ URL

    // Cập nhật giá trị ngôn ngữ và tiền tệ trong NavigationService
    this.navigationService.updateCurrency(currency);
    this.navigationService.updateLang(lang);
  }
}
