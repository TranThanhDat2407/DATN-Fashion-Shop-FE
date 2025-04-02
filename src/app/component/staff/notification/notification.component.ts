import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {Currency} from '../../../models/Currency';
import {WishlistDTO} from '../../../dto/wishlistDTO';
import {ProductVariantDetailDTO} from '../../../models/ProductVariant/product-variant-detailDTO';
import {CategoryParentDTO} from '../../../dto/CategoryParentDTO';
import {ImagesDetailProductDTO} from '../../../dto/ImagesDetailProductDTO';
import {TokenService} from '../../../services/token/token.service';
import {ProductServiceService} from '../../../services/client/ProductService/product-service.service';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {WishlistService} from '../../../services/client/wishlist/wishlist.service';
import {CurrencyService} from '../../../services/currency/currency-service.service';
import {catchError, firstValueFrom, forkJoin, map, Observable, of} from 'rxjs';
import {RouterLink} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {NotificationService} from '../../../services/Notification/notification.service';
import {NotificationDTO} from '../../../models/NotificationDTO';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  userId: number = 0;
  currentLang: string = '';
  currentCurrencyDetail?: Currency;
  currentCurrency: string = '';

  notificationList: NotificationDTO[] = [];

  page: number = 0;  // Biến page để điều hướng trang
  pageSize: number = 2;
  totalPages: number = 1;
  totalNotifications: number = 0;
  productsInWishlist: (WishlistDTO & {
    detail?: ProductVariantDetailDTO | null;
    categoryParent?: CategoryParentDTO[];
    dataImagesProduct: ImagesDetailProductDTO[];
  })[] = [];

  constructor(
    private tokenService: TokenService,
    private productService: ProductServiceService,
    private navigationService: NavigationService,
    private wishlistService: WishlistService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.fetchCurrency();
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await  firstValueFrom(this.navigationService.currentCurrency$);
    this.userId = this.tokenService.getUserId();

    if (this.userId) {
      this.wishlistService.getWishlistTotal(this.userId);
      this.getWishlistByUserId(this.userId);
      this.getNotification(this.userId);
    }

  }

  getWishlistByUserId(userId: number): void {
    if (!this.userId) return;

    this.wishlistService.getUserWishlist(this.userId).subscribe({
      next: (response) => {
        if (!response?.data?.length) {
          this.productsInWishlist = [];
          console.warn('Wishlist is empty or invalid response:', response);
          return;
        }

        const productRequests = response.data.map(product =>
          forkJoin({
            detail: this.getProductDetail(product.productId),
            categoryParent: this.getCategoryParent(this.currentLang, product.productId),
            dataImagesProduct: this.changeImageOne(product.productId, product.colorId)
          }).pipe(
            map(({ detail, categoryParent, dataImagesProduct }) => ({
              ...product,
              detail: detail ?? null,
              categoryParent: categoryParent ?? [],
              dataImagesProduct: dataImagesProduct ?? []
            }))
          )
        );

        forkJoin(productRequests).subscribe(updatedProducts => {
          this.productsInWishlist = updatedProducts;
          console.log('Updated Wishlist:', this.productsInWishlist);
        });
      },
      error: (error) => {
        console.error('Error fetching wishlist:', error);
      }
    });
  }

  getProductDetail(productId: number) {
    return this.productService.getProductDertail(this.currentLang, productId, this.userId).pipe(
      map(response => response.data ?? null),
      catchError(() => of(null))
    );
  }

  getCategoryParent(lang: string, productId: number) {
    return this.productService.getCategoryParent(lang, productId).pipe(
      map(response => response.data ?? []),
      catchError(() => of([]))
    );
  }

  changeImageOne(productId: number, colorId: number) {
    return this.productService.getChangeImageOne(productId, colorId).pipe(
      map(response => response.data ?? []),
      catchError(() => of([]))
    );
  }

  getImageProduct(fileName: string | undefined): string {
    return this.productService.getImageProduct(fileName);
  }

  getCurrencyPrice(price: number, rate: number, symbol: string): string {
    const convertedPrice = price * rate;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: symbol }).format(convertedPrice)
      .replace('US$', '$'); // Xử lý USD để hiển thị ký hiệu $
  }

  fetchCurrency() {
    this.getCurrency().subscribe(({ data }) => {
      const index = { en: 0, vi: 1, jp: 2 }[this.currentLang] ?? 0;
      this.currentCurrencyDetail = data?.[index] || { code: '', name: '', symbol: '', exchangeRate: 0 };
      console.log('Currency Info:', this.currentCurrencyDetail);
    });
  }

  getCurrency() {
    return this.currencyService.getCurrency().pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching currency:', error);
        return of({ timestamp: new Date().toISOString(), status: 500, message: 'Currency API Error', data: [], errors: [] });
      })
    );
  }

  toggleWishlist(productId: number, colorId: number): void {
    if (!this.userId) return;

    this.wishlistService.toggleWishlistInProductDetail(this.userId, productId, colorId).subscribe({
      next: () => {
        this.productsInWishlist = this.productsInWishlist.filter(p => p.productId !== productId || p.colorId !== colorId);
        this.wishlistService.getWishlistTotal(this.userId);
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }

  //--------------------------------------//

  getNotification(userId: number){
    this.notificationService.getUserNotifications(userId, this.currentLang, this.page, this.pageSize, 'id', 'desc').subscribe(response => {
      console.log(response.data)
      this.notificationList = response.data.content;
      this.totalNotifications = response.data.totalElements; // Tổng số thông báo từ API
      this.totalPages = response.data.totalPages;
    });
  }

  deleteNotifyById(id: number) {
    this.notificationService.deleteNotificationById(id).subscribe(
      (response) => {
        console.log(response.message);

        // Xóa trực tiếp trong UI
        this.notificationList = this.notificationList.filter(notify => notify.id !== id);
        this.totalNotifications--;

        if (this.notificationList.length === 0 && this.page > 0) {
          this.page--;
          this.getNotification(this.userId);
        } else {
          this.getNotification(this.userId);
          this.getPageNumbers();
        }

        this.notificationService.getNotifyTotal(this.userId);
      },
      (error) => {
        console.error("Lỗi khi xóa thông báo:", error);
      }
    );
  }





  deleteAllNotify() {
    this.notificationService.deleteNotificationsByUserId(this.userId).subscribe(
      (response) => {
        console.log(response.message);

        // Cập nhật UI sau khi xóa
        this.notificationList = [];
        this.totalNotifications = 0;
        this.page = 0;

        this.getPageNumbers();
        this.notificationService.getNotifyTotal(this.userId);
      },
      (error) => {
        console.error("Lỗi khi xóa tất cả thông báo:", error);
      }
    );
  }


  /**
   * Chuyển đến trang trước
   */
  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.getNotification(this.userId);
    }
  }

  /**
   * Chuyển đến trang sau
   */
  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.getNotification(this.userId);
    }
  }

  /**
   * Chuyển đến một trang cụ thể
   */
  goToPage(pageNumber: number) {
    this.page = pageNumber;
    this.getNotification(this.userId);
  }

  /**
   * Trả về danh sách số trang để hiển thị
   */
  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

}

