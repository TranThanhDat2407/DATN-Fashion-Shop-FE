import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {TokenService} from '../../../services/token/token.service';
import {ProductServiceService} from '../../../services/client/ProductService/product-service.service';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {WishlistService} from '../../../services/client/wishlist/wishlist.service';
import {CurrencyService} from '../../../services/currency/currency-service.service';
import {CookieService} from 'ngx-cookie-service';
import {CartService} from '../../../services/client/CartService/cart.service';
import {DetailProductService} from '../../../services/client/DetailProductService/detail-product-service.service';
import {catchError, firstValueFrom, forkJoin, map, Observable, of} from 'rxjs';
import {ProductVariantDetailDTO} from '../../../models/ProductVariant/product-variant-detailDTO';
import {DetailProductDTO} from '../../../dto/DetailProductDTO';
import {CartDTO} from '../../../dto/CartDTO';
import {CartItemDTO} from '../../../dto/CartItemDTO';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {TotalQty} from '../../../dto/TotalQty';
import {CurrencyPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {BrowserMultiFormatReader} from '@zxing/browser';
import {ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CouponService} from '../../../services/client/CouponService/coupon.service';
import {CouponDTO} from '../../../dto/CouponDTO';
import {UserService} from '../../../services/user/user.service';
import {StorePaymentRequest} from '../../../dto/StorePaymentRequest';
import {StorePaymentResponse} from '../../../dto/StorePaymentResponse';
import {OrderService} from '../../../services/order/order.service';

@Component({
  selector: 'app-staff-checkout',
  standalone: true,
  imports: [
    StoreHeaderComponent,
    NgForOf,
    NgIf,
    CurrencyPipe,
    NgClass,
    FormsModule
  ],
  templateUrl: './staff-checkout.component.html',
  styleUrl: './staff-checkout.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class StaffCheckoutComponent implements OnInit, AfterViewInit {

  userId: number | null = null;
  isValidUser: boolean | null = null;
  staffId: number = 0;
  storeId: number = 0;

  totalCartItems: number = 0;
  sessionId?: string;

  dataDetailsProduct: DetailProductDTO | null = null;
  dataCart: CartDTO | null = null;
  dataProductDetail: ProductVariantDetailDTO[] = [];
  cartItems: CartItemDTO[] = [];

  couponCode: string = '';
  couponDetails: CouponDTO | null = null;

  paymentMethod: string = '4';

  constructor(
    private tokenService: TokenService,
    private productService: ProductServiceService,
    private cartService: CartService,
    private userService: UserService,
    private couponService: CouponService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}


  async ngOnInit(): Promise<void> {
    this.staffId = this.tokenService.getUserId();

    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId');
      if (storeIdParam) {
        this.storeId = +storeIdParam;
      }
    });

    await this.fetchApiCart();
    await this.loadProductDetails();
    this.calculateTotals();
  }

  ngAfterViewInit(): void {
    navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 100 } })
      .then(stream => {
        this.videoStream = stream;
        if (this.scannerVideo?.nativeElement) {
          this.scannerVideo.nativeElement.srcObject = stream;
        }
      })
      .catch(err => console.error('Lỗi khi mở camera:', err));
  }

  totalPrice = 0;
  vat = 0;
  discountAmount = 0;
  orderTotal = 0;

  calculateTotals() {
    if (this.dataCart) {
      this.totalPrice = this.dataCart.totalPrice || 0;
      this.vat = this.totalPrice * 0.1; // Thuế VAT 10%

      if (this.couponDetails) {
        if (this.couponDetails.discountType === 'FIXED') {
          this.discountAmount = this.couponDetails.discountValue || 0;
        } else if (this.couponDetails.discountType === 'PERCENTAGE') {
          this.discountAmount = (this.totalPrice * (this.couponDetails.discountValue || 0)) / 100;
        }
      } else {
        this.discountAmount = 0;
      }

      // Đảm bảo tổng tiền sau giảm giá không âm
      this.orderTotal = Math.max((this.totalPrice + this.vat) - this.discountAmount, 0);
    }
  }

  @ViewChild('scannerVideo') scannerVideo!: ElementRef<HTMLVideoElement>;
  isScanning = false;
  codeReader = new BrowserMultiFormatReader();
  videoStream: MediaStream | null = null;
  message: string = '';
  showErrorMessage: boolean = false;

  startScan() {
    // Mở camera và gán stream cho video mỗi lần quét
    navigator.mediaDevices.getUserMedia({ video: { width: 200, height: 200 } })
      .then(stream => {
        this.videoStream = stream;
        if (this.scannerVideo && this.scannerVideo.nativeElement) {
          this.scannerVideo.nativeElement.srcObject = stream;
          // Cho video chạy (đảm bảo thuộc tính autoplay và playsinline có ở HTML)
          this.scannerVideo.nativeElement.play();
        }
        this.isScanning = true;
        // Dùng decodeOnceFromVideoDevice để chỉ quét một lần
        this.codeReader.decodeOnceFromVideoDevice(undefined, this.scannerVideo.nativeElement)
          .then(result => {
            console.log('Barcode detected:', result.getText());
            // Gọi API thêm sản phẩm vào giỏ hàng
            this.cartService.addToCartStaff(this.staffId, this.storeId, result.getText(), 1)
              .subscribe({
                next: async (response) => {

                  await this.fetchApiCart();
                  await this.loadProductDetails();

                  this.cd.detectChanges();

                },
                error: (err) => {

                  let errorMessage = 'An unexpected error occurred';
                  // Kiểm tra nếu có lỗi chi tiết trong mảng errors
                  if (err.error && err.error.errors && err.error.errors.length > 0) {
                    errorMessage = err.error.errors[0].message;
                  }
                  // Sau đó, gán message này cho biến hiển thị thông báo lỗi (ví dụ this.message)
                  this.productErrorMessage = errorMessage;


                }
              });

            // Sau khi quét thành công, tắt camera
            this.stopScan();

            // Sau 2 giây, tự động gọi lại startScan() để quét tiếp
            setTimeout(() => {
              this.startScan();
            }, 2000);
          })
          .catch(err => {
            console.error('Lỗi khi quét:', err);
            // Nếu có lỗi, dừng camera và thử lại sau 2 giây
            this.stopScan();
            setTimeout(() => {
              this.startScan();
            }, 2000);
          });
      })
      .catch(err => {
        console.error('Lỗi khi mở camera:', err);
      });
  }


  stopScan() {
    this.isScanning = false; // Ẩn UI quét

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => {
        track.stop(); // Tắt từng track video
      });
      this.videoStream = null;
    }

    if (this.scannerVideo?.nativeElement) {
      this.scannerVideo.nativeElement.srcObject = null; // Ngắt luồng video
    }
  }

  productErrorMessage = '';
  addProductManual(variantId: string): void {
    // Kiểm tra xem variantId có hợp lệ không
    this.productErrorMessage = '';

    if (!variantId || variantId.trim() === '') {
      // Hiển thị thông báo lỗi nếu cần
      this.productErrorMessage = "Please enter the product variant ID!";
      this.clearMessages();
      return;
    }

    // Gọi API thêm sản phẩm vào giỏ hàng
    this.cartService.addToCartStaff(this.staffId, this.storeId, variantId, 1)
      .subscribe({
        next: async (response) => {

          await this.fetchApiCart();
          await this.loadProductDetails();
          this.calculateTotals();
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
          let errorMessage = 'An unexpected error occurred';
          if (err.error && err.error.errors && err.error.errors.length > 0) {
            errorMessage = err.error.errors[0].message;
          }
          this.productErrorMessage = errorMessage;
          this.clearMessages();
        }
      });
  }


  async fetchApiCart(): Promise<void> {
    const callApi = {
      dataCart: this.getDataCart(this.staffId ?? 0, ""),
    };

    const response = await firstValueFrom(forkJoin(callApi));

    this.dataCart = response.dataCart;
    this.cartItems = response.dataCart?.cartItems || [];

    // Cập nhật totalCartItems dựa trên tổng số lượng sản phẩm trong giỏ hàng
    this.totalCartItems = this.cartItems.reduce((total, item) => total + item.quantity, 0);

    this.calculateTotals();
    this.cd.detectChanges();
  }


  async loadProductDetails(): Promise<void> {
    if (this.cartItems.length === 0) {
      return;
    }

    const requests = this.cartItems.map((item) =>
      this.getProductDetail("vi", item.productVariantId)
    );

    const results = await firstValueFrom(forkJoin(requests));

    // Lọc bỏ giá trị null
    this.dataProductDetail = results.filter((product): product is ProductVariantDetailDTO => product !== null);

  }


  getProductDetailByProductVariantId(productVariantId: number): ProductVariantDetailDTO {
    if (!this.dataProductDetail || !Array.isArray(this.dataProductDetail)) {
      return {} as ProductVariantDetailDTO; // Trả về một object rỗng thay vì null
    }
    return this.dataProductDetail.find(item => item.id === productVariantId) ?? ({} as ProductVariantDetailDTO);
  }

  getDataCart(userId: number, sessionId: string): Observable<CartDTO | null> {
    return this.cartService.getAllCart(userId, sessionId).pipe(
      map((response: ApiResponse<CartDTO>) => response.data || null),
      catchError((error) => {
        console.error("Lỗi khi gọi API getDataCart:", error);
        return of(null);
      })
    );
  }

  getProductDetail(lang: string, productVariantId: number): Observable<ProductVariantDetailDTO | null> {
    return this.productService.getProductVariant(lang, productVariantId).pipe(
      map((response: ApiResponse<ProductVariantDetailDTO>) => response.data || null),
      catchError((error) => {
        return of(null);
      })
    );
  }

  updateQuantity(cart: CartItemDTO, newQuantity: number | string): void {
    newQuantity = Number(newQuantity);

    if (newQuantity < 1) {
      newQuantity = 1;
    }

    // Cập nhật giá trị số lượng vào cart
    cart.quantity = newQuantity;

    // Tạo request update (theo định dạng mà API yêu cầu)
    const request = {
      productVariantId: cart.productVariantId,
      quantity: cart.quantity
    };

    // Gọi API update cart (staffUpdateCart)
    this.cartService.staffUpdateCart(this.staffId, this.storeId, request)
      .subscribe({
        next: async (response) => {
          console.log('Cập nhật cart thành công:', response);
          await this.fetchApiCart();
          await this.loadProductDetails();
        },
        error: async( err) => {
          cart.quantity = 1;
          this.cd.detectChanges();
          let errorMessage = 'An unexpected error occurred';
          // Kiểm tra nếu có lỗi chi tiết trong mảng errors
          if (err.error && err.error.errors && err.error.errors.length > 0) {
            errorMessage = err.error.errors[0].message;
          }
          // Sau đó, gán message này cho biến hiển thị thông báo lỗi (ví dụ this.message)
          this.productErrorMessage = errorMessage;
          this.clearMessages();
          await this.fetchApiCart();
          await this.loadProductDetails();

        }
      });
  }

  // Hàm xóa 1 item khỏi cart
  removeCartItem(cartItemId: number): void {
    this.cartService.removeFromCart(this.staffId, "", cartItemId)
      .subscribe({
        next: async (response) => {
          console.log('Xóa item thành công:', response);
          await this.fetchApiCart();
          await this.loadProductDetails();
        },
        error: (err) => {
          console.error('Lỗi khi xóa item:', err);
        }
      });
  }

  // Hàm xóa toàn bộ cart
  clearCart(): void {
    this.cartService.clearCart(this.staffId, "")
      .subscribe({
        next: async (response) => {
          await this.fetchApiCart();
        },
        error: (err) => {
          console.error('Lỗi khi clear cart:', err);
        }
      });
  }

  couponErrorMessage?: string;
  couponSuccessMessage?: string;
  applyCoupon() {
    if (!this.userId) {
      this.couponErrorMessage = "Enter User ID Before Apply Coupon.";
      this.clearMessages();
      return;
    }

    if (!this.couponCode.trim()) {
      this.couponDetails = null;
      this.couponErrorMessage = "Enter a coupon code.";
      this.clearMessages();
      return;
    }

    this.couponService.getCouponByCode(this.couponCode).subscribe({
      next: (data) => {
        const now = new Date();
        const expirationDate = new Date(data.expirationDate);

        // Kiểm tra minOrderValue
        if (this.totalPrice < data.minOrderValue) {
          this.couponErrorMessage = `Min order: ${data.minOrderValue.toLocaleString()} VND.`;
          this.couponDetails = null;
          this.clearMessages();
          return;
        }

        // Kiểm tra hạn sử dụng
        if (expirationDate < now) {
          this.couponErrorMessage = "Coupon expired.";
          this.couponDetails = null;
          return;
        }

        // Kiểm tra user có được dùng coupon không
        this.couponService.validateCouponUser(this.userId ?? 0, data.id).subscribe({
          next: (isValid) => {
            console.log(isValid);
            if (!isValid) {
              this.couponErrorMessage = "Invalid for this user.";
              this.couponDetails = null;
              return;
            }

            this.couponDetails = data;

            this.couponSuccessMessage = `Applied: ${data.code}`;
            this.calculateTotals();
            this.clearMessages();
          },
          error: () => {
            this.couponErrorMessage = "Validation error.";
            this.clearMessages();
            this.couponDetails = null;
          }
        });
      },
      error: () => {
        this.couponErrorMessage = "Invalid or expired code.";
        this.clearMessages();
        this.couponDetails = null;
      }
    });
  }

  @ViewChild('couponScannerVideo') couponScannerVideo!: ElementRef<HTMLVideoElement>;
  isCouponScanning = false;
  couponCodeReader = new BrowserMultiFormatReader();
  couponVideoStream: MediaStream | null = null;
  couponMessage: string = '';
  couponId: number | null = null;
  showCouponError: boolean = false;

  startCouponScan() {
    navigator.mediaDevices.getUserMedia({ video: { width: 200, height: 200 } })
      .then(stream => {
        this.videoStream = stream;
        if (this.couponScannerVideo && this.couponScannerVideo.nativeElement) {
          this.couponScannerVideo.nativeElement.srcObject = stream;
          // Cho video chạy (đảm bảo thuộc tính autoplay và playsinline có ở HTML)
          this.couponScannerVideo.nativeElement.play();
        }
        this.isCouponScanning = true;

        // Bắt đầu quét mã
        this.couponCodeReader.decodeOnceFromVideoDevice(undefined, this.couponScannerVideo.nativeElement)
          .then(result => {
            console.log('ID Coupon quét được:', result.getText());
            const scannedId = Number(result.getText());

            if (!isNaN(scannedId)) {
              this.couponId = scannedId;
              this.applyCouponById(); // Tự động áp dụng coupon bằng ID
            } else {
              this.couponMessage = 'Mã coupon không hợp lệ!';
              this.showCouponError = true;
            }

            this.stopCouponScan();
          })
          .catch(err => {
            console.error('Lỗi khi quét coupon:', err);
            this.stopCouponScan();
            setTimeout(() => {
              this.startCouponScan();
            }, 2000);
          });
      })
      .catch(err => {
        console.error('Lỗi khi mở camera:', err);
      });
  }
  stopCouponScan() {
    this.isCouponScanning = false;
    if (this.couponVideoStream) {
      this.couponVideoStream.getTracks().forEach(track => track.stop());
      this.couponVideoStream = null;
    }
    if (this.couponScannerVideo?.nativeElement) {
      this.couponScannerVideo.nativeElement.srcObject = null;
    }
  }

  applyCouponById() {
    if (!this.userId) {
      this.couponErrorMessage = "Enter User ID before applying coupon.";
      this.clearMessages();
      return;
    }

    if (!this.couponId) {
      this.couponErrorMessage = "Enter a valid coupon ID.";
      this.clearMessages();
      return;
    }

    this.couponService.getCouponById(this.couponId).subscribe({
      next: (data) => {
        const now = new Date();
        const expirationDate = new Date(data.expirationDate);

        // Kiểm tra giá trị tối thiểu của đơn hàng
        if (this.totalPrice < data.minOrderValue) {
          this.couponErrorMessage = `Min order: ${data.minOrderValue.toLocaleString()} VND.`;
          this.couponDetails = null;
          this.clearMessages();
          return;
        }

        // Kiểm tra hạn sử dụng
        if (expirationDate < now) {
          this.couponErrorMessage = "Coupon expired.";
          this.couponDetails = null;
          this.clearMessages();
          return;
        }

        // Kiểm tra quyền sử dụng coupon
        this.couponService.validateCouponUser(this.userId ?? 0, data.id).subscribe({
          next: (isValid) => {
            if (!isValid) {
              this.couponErrorMessage = "Invalid for this user.";
              this.couponDetails = null;
              return;
            }

            this.couponDetails = data;
            this.couponSuccessMessage = `Applied: ${data.code}`;
            console.log('Coupon applied:', data);
            this.calculateTotals();
            this.clearMessages();
          },
          error: () => {
            this.couponErrorMessage = "Validation error.";
            this.couponDetails = null;
            this.clearMessages();
          }
        });
      },
      error: () => {
        this.couponErrorMessage = "Invalid or expired coupon ID.";
        this.couponDetails = null;
        this.clearMessages();
      }
    });
  }

  checkUserValid() {
    if (!this.userId) {
      this.isValidUser = null;
      return;
    }

    this.userService.checkUserValid(this.userId).subscribe({
      next: (valid) => {
        this.isValidUser = valid;
        if (!valid) {
          this.userId = null;
        }
      },
      error: () => {
        this.isValidUser = false;
        this.userId = null;
      }
    });
  }

  onUserIdChange() {
    this.isValidUser = null;
    console.log(this.userId);
  }

  @ViewChild('userScannerVideo') userScannerVideo!: ElementRef<HTMLVideoElement>;
  isUserScanning = false;
  userCodeReader = new BrowserMultiFormatReader();
  userVideoStream: MediaStream | null = null;
  userMessage: string = '';
  showUserError: boolean = false;

  startUserScan() {
    navigator.mediaDevices.getUserMedia({ video: { width: 200, height: 200 } })
      .then(stream => {
        this.userVideoStream = stream;
        if (this.userScannerVideo && this.userScannerVideo.nativeElement) {
          this.userScannerVideo.nativeElement.srcObject = stream;
          this.userScannerVideo.nativeElement.play();
        }
        this.isUserScanning = true;

        this.userCodeReader.decodeOnceFromVideoDevice(undefined, this.userScannerVideo.nativeElement)
          .then(result => {
            console.log('User barcode detected:', result.getText());

            this.userService.checkUserValid(Number(result.getText())).subscribe({
              next: (valid) => {
                this.isValidUser = valid;
                if (!valid) {
                  this.userId = null;
                  this.showUserError = true;
                  setTimeout(() => this.showUserError = false, 5000);
                } else {
                  this.userId = parseInt(result.getText(), 10);
                }
              },
              error: () => {
                this.isValidUser = false;
                this.userId = null;
                this.showUserError = true;
                setTimeout(() => this.showUserError = false, 5000);
              }
            });
            // Dừng quét sau khi có kết quả
            this.stopUserScan();

          })
          .catch(err => {
            console.error('Lỗi khi quét mã người dùng:', err);
            this.stopUserScan();
            setTimeout(() => this.startUserScan(), 2000);
          });
      })
      .catch(err => {
        console.error('Lỗi khi mở camera:', err);
      });
  }


  stopUserScan() {
    this.isUserScanning = false;

    if (this.userVideoStream) {
      this.userVideoStream.getTracks().forEach(track => track.stop());
      this.userVideoStream = null;
    }

    if (this.userScannerVideo?.nativeElement) {
      this.userScannerVideo.nativeElement.srcObject = null;
    }
  }

  orderSuccessMessage?: string;
  orderFailedMessage?: string;
  createOrder(): void {
    if (!this.dataCart || this.cartItems.length === 0) {
      this.orderFailedMessage = "Empty cart!";
      this.showErrorMessage = true;
      setTimeout(() => { this.showErrorMessage = false; }, 5000);
      return;
    }
    // Tạo request object
    const request: StorePaymentRequest = {
      userId: this.userId,
      storeId: this.storeId,
      couponId: this.couponDetails ? this.couponDetails.id : null,
      paymentMethodId: Number(this.paymentMethod),
      totalPrice: this.orderTotal,
      totalAmount: this.totalCartItems,
      taxAmount: this.vat,
      transactionCode: null
    };
    console.log(this.couponId);
    this.orderService.createStoreOrder(this.staffId, request).subscribe({
      next: (response: any) => {
        this.orderSuccessMessage = `Order #${response.data.orderId} placed successfully!`;
        this.couponDetails = null;
        this.userId = null;
        this.showErrorMessage = false;
        this.clearCart();
        setTimeout(() => (this.orderSuccessMessage = ""), 3000);
      },
      error: (err: { error: { errors: string | any[]; }; }) => {
        let errorMessage = "";
        if (err.error && err.error.errors && err.error.errors.length > 0) {
          errorMessage = err.error.errors[0].message;
        }
        this.orderFailedMessage = errorMessage;
        setTimeout(() => { this.showErrorMessage = false; }, 5000);
      }
    });
  }

  clearMessages() {
    setTimeout(() => {
      this.couponErrorMessage = '';
      this.productErrorMessage  = '';
    }, 3000);
  }

}
