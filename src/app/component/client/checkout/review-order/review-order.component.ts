import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AsyncPipe, CurrencyPipe, DecimalPipe, NgIf} from '@angular/common';
import { ShippingComponent } from '../shipping/shipping.component';
import { PaymentComponent } from '../payment/payment.component';
import { CheckoutService } from '../../../../services/checkout/checkout.service';
import { NavigationService } from '../../../../services/Navigation/navigation.service';
import { firstValueFrom } from 'rxjs';
import { CartDTO } from '../../../../dto/CartDTO';
import { CouponLocalizedDTO } from '../../../../dto/coupon/CouponClientDTO';
import { Currency } from '../../../../models/Currency';
import { CartService } from '../../../../services/client/CartService/cart.service';
import { TokenService } from '../../../../services/token/token.service';
import { CookieService } from 'ngx-cookie-service';
import { CouponService } from '../../../../services/client/CouponService/coupon-service.service';
import {AddressDTO} from '../../../../dto/address/AddressDTO';
import {ShippingService} from '../../../../services/client/ShippingService/shipping-service.service';
import {PaypalService} from '../../../../services/paypal/paypal.service';

@Component({
  selector: 'app-review-order',
  standalone: true,
  imports: [NgIf, ShippingComponent, PaymentComponent, DecimalPipe, AsyncPipe, CurrencyPipe],
  templateUrl: './review-order.component.html',
  styleUrls: ['./review-order.component.scss']
})
export class ReviewOrderComponent implements OnInit {
  usdRate: number = 0;

  shippingInfo: any = {};
  cartData: CartDTO | null = null;
  selectedShippingMethod: number = 2;
  paymentInfo: any = {};
  userId?: number;
  sessionId: string;
  appliedCoupon: CouponLocalizedDTO | null = null;
  qtyTotal: number = 0;

  currentCurrencyDetail?: Currency;

  currentLang: string = ''; // Ngôn ngữ mặc định
  currentCurrency: string = ''; // Tiền tệ mặc định


  constructor(
    private router: Router,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private couponService: CouponService,
    private navigationService: NavigationService,
    private shippingService : ShippingService,
    private paypal: PaypalService
  ) {
    this.sessionId = this.cookieService.get('SESSION_ID') || '';
  }

  async ngOnInit(): Promise<void> {
    this.userId = this.tokenService.getUserId() ?? 0;
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);

    this.navigationService.getCurrency().subscribe({
      next: (currencies) => {
        const usd = currencies.find(c => c.code === 'USD');
        if (usd) {
          this.usdRate = usd.rateToBase;
          console.log(`✅ Tỷ giá USD đã được cache: ${this.usdRate}`);
        } else {
          console.error('❌ Không tìm thấy tỷ giá USD trong danh sách.');
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi gọi API lấy tỷ giá:', err);
      }
    });

    this.checkoutService.shippingInfo$.subscribe(shippingInfo => {
      if(shippingInfo){
        this.shippingInfo = shippingInfo;
        console.log('CheckoutComponent -  Nhận shippingInfo:', shippingInfo );
      }

    });
    this.checkoutService.paymentInfo.subscribe(payment => {
      console.log("📢 Payment info nhận được trong ReviewOrder:", payment);
      if (payment) {
        this.paymentInfo = payment;
        console.log("🎯 Phương thức thanh toán trong ReviewOrder:", payment.paymentMethodId);
      } else {
        console.warn("⚠️ Không có phương thức thanh toán nào được chọn!");
      }
    });

    this.cartService.getAllCart(this.userId,this.sessionId).subscribe({
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
  }

  getCurrencyPrice(price: number, rate: number, symbol: string): string {
    if (!symbol || symbol.trim() === "") {
      symbol = "USD"; // Gán mặc định là USD nếu không hợp lệ
    }

    const convertedPrice = price * rate;

    try {
      const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: symbol }).format(convertedPrice);
      return symbol === 'USD' ? formattedPrice.replace('US$', '$') : formattedPrice;
    } catch (error) {
      console.error("❌ Lỗi khi format tiền tệ:", error);
      return `${convertedPrice} ${symbol}`;
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


  /** 🔹 Xác nhận đặt hàng */
  confirmOrder(): void {
    console.log("📌 selectedShippingMethod:", this.selectedShippingMethod);
    console.log("📌 paymentMethodId:", this.paymentInfo.paymentMethodId);

    const orderRequest = this.checkoutService.getCheckoutData();
    if (this.paymentInfo.paymentMethodId === 6) {
      this.checkoutService.placeOrder(orderRequest).subscribe({
          next: (response) => {
            if (response.paymentUrl) {
              // ✅ Hướng xử lý PayPal (hoặc VNPay)
              window.location.href = response.paymentUrl;
            } else if (typeof response?.payUrl === 'string') {
              window.location.href = response.payUrl;
            } else {
              // ✅ Trường hợp COD / PAY-IN-STORE
              this.router.navigate(['/client', this.currentCurrency, this.currentLang, 'checkout-confirmation'], {
                queryParams: { orderId: response.orderId }
              });
            }
          },
          error: (err) => {
            console.error('❌ Đặt hàng thất bại:', err);
            alert('Đặt hàng thất bại. Vui lòng thử lại.');
          }
        }
      );
    } else {
      this.checkoutService.placeOrder(orderRequest).subscribe(
        response => {

          if (response.paymentUrl) {
            console.log("🔗 Chuyển hướng tới VNPay:", response.paymentUrl);
            window.location.href = response.paymentUrl;

          } else if (typeof response?.payUrl === 'string' && response.payUrl.startsWith('http')) {
            console.log("🔗 Chuyển hướng tới MoMo:", response.payUrl);
            window.location.href = response.payUrl;

          } else {
            console.log("✅ Đơn hàng không dùng ví điện tử, chuyển đến trang xác nhận.");
            this.router.navigate(['/client', this.currentCurrency, this.currentLang, 'checkout-confirmation'], {
              queryParams: {orderId: response.orderId}
            });
          }
        },
        error => {
          console.error('❌ Lỗi khi đặt hàng:', error);
          alert('Đặt hàng thất bại. Vui lòng thử lại.');
        }
      );
    }
  }


}
