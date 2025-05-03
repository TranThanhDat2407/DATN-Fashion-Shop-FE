import { NgClass, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { LanguageDTO } from '../../../dto/LanguageDTO';
import { CurrencyDTO } from '../../../dto/CurrencyDTO';
import { CategoryService } from '../../../services/client/CategoryService/category.service';
import { CategoryDTO } from '../../../dto/CategoryDTO';
import { WishlistService } from '../../../services/client/wishlist/wishlist.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { TokenService } from '../../../services/token/token.service';
import { CookieService } from 'ngx-cookie-service';
import { TotalQty } from '../../../dto/TotalQty';
import { CartService } from '../../../services/client/CartService/cart.service';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { SessionService } from '../../../services/session/session.service';
import {NotificationService} from '../../../services/Notification/notification.service';
import {NotificationDTO} from '../../../models/NotificationDTO';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink, TranslateModule, CommonModule],
  providers: [CookieService],

  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  categoriesParent: CategoryDTO[] = [];
  apiError: any;
  isHome: boolean = false;
  currentLang: string = ''; // Ngôn ngữ mặc định
  currentCurrency: string = ''; // Tiền tệ mặc định
  isSearchActive: boolean = false;
  sessionId?: string;

  userId: number = 0;
  totalWishlist$!: Observable<number>;
  totalCart$!: Observable<number>;
  totalNotify$ !: Observable<number>

  notifications: NotificationDTO[] = [];

  constructor(private router: Router,
              private navigationService: NavigationService,
              private categoryService: CategoryService,
              private wishlistService: WishlistService,
              private cookieService: CookieService,
              private cartService: CartService,
              private sessionService: SessionService,
              private tokenService: TokenService,
              private notificationService: NotificationService,) {
    // Lắng nghe sự kiện NavigationEnd để kiểm tra URL hiện tại
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Kiểm tra nếu URL hiện tại là trang Home
        const segments = this.router.url.split('/');
        this.isHome = segments.length === 4 && segments[1] === 'client';
      }
    });

    // Lắng nghe giá trị ngôn ngữ và tiền tệ từ NavigationService
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    this.navigationService.isSearchActive$.subscribe((value) => {
      this.isSearchActive = value;
    });


  }

  totalCartItems: number = 0;
  async ngOnInit(): Promise<void> {
    this.sessionId = this.sessionService.getSession() ?? ''
    const sessionId = this.sessionService.getSession();
    this.userId = this.tokenService.getUserId()

    this.cartService.totalCart$.subscribe(total => {
      this.totalCartItems = total;
    });

    this.cartService.getQtyCart(this.userId, sessionId ?? '');
    this.getLanguage();
    this.getCurrency();
    this.getCategoriesParent(this.currentLang);
    this.categoryService.loadCategories(this.currentLang, 1);
    this.totalWishlist$ = this.wishlistService.totalWishlist$;
    this.totalNotify$ = this.notificationService.totalNotify$;
    this.userId = this.tokenService.getUserId();
    if (this.userId) {
      this.wishlistService.getWishlistTotal(this.userId);
      this.notificationService.getNotifyTotal(this.userId);
      this.getNotification(this.userId);
    }
    console.log("totalNotify: "+this.totalNotify$);
  }




  getLanguage(): void {
    this.navigationService.getLanguage().subscribe({
      next: (languages: LanguageDTO[]) => {
        this.languageList = languages;
      },
      error: (err) => console.error(err)
    });
  }

  getCurrency(): void {
    this.navigationService.getCurrency().subscribe({
      next: (currencies: CurrencyDTO[]) => {
        this.currencyList = currencies;
      },
      error: (err) => console.error(err)
    });
  }


  getCategoriesParent(lang: string) {

    this.categoryService.getCategoryParent(lang).subscribe({
      next: (response) => {
        this.categoriesParent = response.data;
        this.apiError = response.errors;
      },
      error: (err) => {
        console.log('Http Error: ', err);
        console.log('Lỗi: ', this.apiError);
      }
    })
  }



  onCategoryClick(parentId: number): void {
    // Lấy ngôn ngữ hiện tại
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    // lấy category theo ngôn ngữ và parentId
    this.categoryService.loadCategories(this.currentLang, parentId);
  }

  getNotification(userId: number){
    this.notificationService.getUserNotifications(this.userId, 'vi', 0, 5, 'id', 'desc').subscribe(response => {
      this.notifications = response.data.content;
    });
  }

  languageList: LanguageDTO[] = [];
  currencyList: CurrencyDTO[] = [];

  languageDropdownVisible: boolean = false;
  currencyDropdownVisible: boolean = false;

  toggleDropdown() {
    this.languageDropdownVisible = !this.languageDropdownVisible;
    this.currencyDropdownVisible = !this.currencyDropdownVisible;
  }

  setHoverState(state: boolean) {
    // Điều chỉnh trạng thái hover để hiển thị danh sách
    if (state) {
      this.languageDropdownVisible = true;
      this.currencyDropdownVisible = true;
    } else {
      this.languageDropdownVisible = false;
      this.currencyDropdownVisible = false;
    }
  }

  toggleLanguageDropdown() {
    this.languageDropdownVisible = !this.languageDropdownVisible;
  }

  toggleCurrencyDropdown() {
    this.currencyDropdownVisible = !this.currencyDropdownVisible;
  }

  changeLanguage(lang: string) {

    this.navigationService.updateLang(lang);
    this.getCategoriesParent(this.currentLang);

    const updatedUrl = this.router.url.replace(
      /\/client\/[^\/]+\/[^\/]+/,
      `/client/${this.currentCurrency}/${lang}`
    );

    this.router.navigateByUrl(updatedUrl);
    window.location.href = updatedUrl;
  }

  changeCurrency(currency: string) {
    // Cập nhật giá trị tiền tệ trong NavigationService
    this.navigationService.updateCurrency(currency);
    this.getCategoriesParent(this.currentLang);

    const updatedUrl = this.router.url.replace(
      /\/client\/[^\/]+\/[^\/]+/,
      `/client/${currency}/${this.currentLang}`
    );

    this.router.navigateByUrl(updatedUrl);
    window.location.href = updatedUrl;
  }


}
// Subscribe để nhận giá trị từ service
