import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from '@angular/router';
import {CurrencyPipe, NgIf} from '@angular/common';
import {ReviewOrderComponent} from './review-order/review-order.component';
import {PaymentComponent} from './payment/payment.component';
import {ShippingComponent} from './shipping/shipping.component';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {CheckoutService} from '../../../services/checkout/checkout.service';
import {CartService} from '../../../services/client/CartService/cart.service';
import {TokenService} from '../../../services/token/token.service';
import {CookieService} from 'ngx-cookie-service';
import {CartDTO} from '../../../dto/CartDTO';
import {CouponService} from '../../../services/client/CouponService/coupon-service.service';
import {CouponLocalizedDTO} from '../../../dto/coupon/CouponClientDTO';
import {Currency} from '../../../models/Currency';
import {TranslateModule} from '@ngx-translate/core';
import {catchError, firstValueFrom, map, Observable, of, tap} from 'rxjs';
import {CurrencyService} from '../../../services/currency/currency-service.service';
import {ApiResponse} from '../../../dto/Response/ApiResponse';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterOutlet,
    ShippingComponent,
    PaymentComponent, ReviewOrderComponent, NgIf, RouterLink, CurrencyPipe,TranslateModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  currentLang: string = '';
  currentCurrency: string = '';
  shippingInfo: any = {};
  currentStep: string = 'shipping'; // Mặc định là 'shipping'
  cartData: CartDTO | null = null;
  userId?: number;
  sessionId: string;
  appliedCoupon : CouponLocalizedDTO | null = null;
  qtyTotal: number = 0;
  currentCurrencyDetail?: Currency;
  constructor(private router: Router, private route: ActivatedRoute,
              private navigationService: NavigationService,
              private cartService: CartService,
              private tokenService: TokenService,
              private cookieService: CookieService,
              private couponService : CouponService,
              private checkoutService : CheckoutService,
              private currencySevice: CurrencyService,

  ) {
    this.sessionId = this.cookieService.get('SESSION_ID') || '';
  }



  async ngOnInit(): Promise<void>  {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);

    this.userId = this.tokenService.getUserId() ?? 0;
    // Theo dõi sự thay đổi URL để cập nhật currentStep
    this.route.url.subscribe((urlSegments) => {
      const lastSegment = urlSegments[urlSegments.length - 1]?.path;
      this.currentStep = lastSegment || 'shipping';
    });

    this.checkoutService.shippingInfo$.subscribe(shippingInfo => {
      if (shippingInfo) {
        this.shippingInfo = shippingInfo;
        console.log('CheckoutComponent -  Nhận shippingInfo:', shippingInfo);
      }

    });

    this.cartService.getAllCart(this.userId, this.sessionId).subscribe({
      next: (response) => {
        this.cartData = response.data;
        this.checkoutService.setCartData(this.cartData);

      },
      error: (error) => {
        console.error('Lỗi khi lấy giỏ hàng:', error);
      }
    });
    this.appliedCoupon = this.couponService.getCouponDTO();
    if (this.appliedCoupon) {
      console.log('🎉 Coupon áp dụng:', this.appliedCoupon);
    } else {
      console.log('⚠️ Không có mã giảm giá nào!');
    }
    console.log("Danh sách sản phẩm đã tải:", this.qtyTotal);

    this.fetchCurrency();

  }



  getCurrencyPrice(price: number, rate: number, symbol: string): string {
    if (!symbol || symbol.trim() === "") {
      symbol = "USD"; // Gán mặc định là USD nếu không hợp lệ
    }

    const convertedPrice = price * rate;

    try {
      const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: symbol }).format(convertedPrice);

      // Nếu ký hiệu là USD thì thay thế "US$" bằng "$"
      return symbol === 'USD' ? formattedPrice.replace('US$', '$') : formattedPrice;
    } catch (error) {
      console.error("❌ Lỗi khi format tiền tệ:", error);
      return `${convertedPrice} ${symbol}`; // Trả về chuỗi đơn giản nếu format thất bại
    }
  }
  getDiscountAmount(): number {
    if (!this.appliedCoupon || !this.cartData) return 0;

    if (this.appliedCoupon.discountType === 'PERCENTAGE') {
      return (this.cartData.totalPrice ?? 0) * (this.appliedCoupon.discountValue / 100);
    }

    return this.appliedCoupon.discountValue ?? 0;
  }

  getTotalAfterDiscount(): number {
    return Math.max(
      (this.cartData?.totalPrice ?? 0) - this.getDiscountAmount(),
      0
    );
  }

  getVATAmount(): number {
    const subtotal = (this.cartData?.totalPrice ?? 0) - this.getDiscountAmount();
    const taxRate = 0.08;
    return Math.round(subtotal * taxRate * 100) / 100;
  }

  getGrandTotal(): number {
    const subtotal = this.getTotalAfterDiscount();
    const vat = this.getVATAmount();
    const shippingFee = this.shippingInfo?.shippingFee ?? 0;
    return subtotal + vat + shippingFee;
  }


  fetchCurrency() {
    this.getCurrency().subscribe(({ data }) => {
      const index = { USD: 0, VND: 1, JPY: 2 }[this.currentCurrency] ?? 0;
      const currency = data?.[index] || { code: '', name: '', symbol: '', exchangeRate: 0 };
      this.currentCurrencyDetail = currency
      console.log('Thông tin tiền tệ:', currency);
    });
  }


  getCurrency(): Observable<ApiResponse<Currency[]>> {
    return this.currencySevice.getCurrency().pipe(
      tap(response => console.log("📢 API Currency Response:", response)), // Log dữ liệu API
      map((response: ApiResponse<Currency[]>) => {
        if (!response.data || response.data.length === 0) {
          console.warn("⚠️ API không trả về danh sách tiền tệ hợp lệ!");
          return { ...response, data: [{ id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rateToBase: 1, isBase: true }] };
        }
        return response;
      }),
      catchError(error => {
        console.error('❌ Lỗi khi gọi API tiền tệ:', error);
        return of({
          timestamp: new Date().toISOString(),
          status: 500,
          message: 'Lỗi khi gọi API tiền tệ',
          data: [{ id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rateToBase: 1, isBase: true }],
          errors: ['Không thể lấy dữ liệu tiền tệ']
        } as ApiResponse<Currency[]>);
      })
    );
  }


}
