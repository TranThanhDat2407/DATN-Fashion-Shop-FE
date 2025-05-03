import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CartService} from '../../../services/client/CartService/cart.service';
import {catchError, firstValueFrom, forkJoin, map, Observable, of} from 'rxjs';
import {TokenService} from '../../../services/token/token.service';
import {UserService} from '../../../services/user/user.service';
import {NgIf} from '@angular/common';
import {StoreDetailDTO} from '../../../dto/StoreDetailDTO';
import {ProductVariantDetailDTO} from '../../../models/ProductVariant/product-variant-detailDTO';
import {DetailProductDTO} from '../../../dto/DetailProductDTO';
import {CartDTO} from '../../../dto/CartDTO';
import {CartItemDTO} from '../../../dto/CartItemDTO';
import {UserDetailDTO} from '../../../dto/UserDetailDTO';
import {CouponDTO} from '../../../dto/CouponDTO';
import QRCode from 'qrcode';
import {StoreService} from '../../../services/client/store/store.service';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {ProductServiceService} from '../../../services/client/ProductService/product-service.service';

@Component({
  selector: 'app-momo-store-success',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './momo-store-success.component.html',
  styleUrl: './momo-store-success.component.scss'
})
export class MomoStoreSuccessComponent implements OnInit, AfterViewInit {
  orderId?: number;
  userId: number | null = null;
  staffId: number = 0;
  storeId: number = 0;
  customerName?: String;
  totalPrice = 0;
  vat = 0;
  discountAmount = 0;
  orderTotal = 0;
  totalCartItems: number = 0;
  dataDetailsProduct: DetailProductDTO | null = null;
  dataProductDetail: ProductVariantDetailDTO[] = [];
  cartItems: CartItemDTO[] = [];
  dataCart: CartDTO | null = null;
  store: StoreDetailDTO | null = null;

  staffDetail!: UserDetailDTO;
  couponCode: string = '';
  couponDetails: CouponDTO | null = null;


  paymentData: any = {};
  isSuccess: boolean | null = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private  cartService: CartService,
    private tokenService: TokenService,
    private productService: ProductServiceService,
    private storeService: StoreService,
    private userService: UserService,
    private cd: ChangeDetectorRef,
  ) {}




  ngOnInit(): void {
    (async () => {
      // lấy staffId & storeId
      const savedStaffId = localStorage.getItem('staffId');
      this.staffId = savedStaffId ? +savedStaffId : this.tokenService.getUserId();

      const params = this.route.snapshot.queryParams;
      this.paymentData = params;
      this.isSuccess = params['resultCode'] === '0';

      const fullOrderId = params['orderId'];
      if (fullOrderId) {
        const parts = fullOrderId.split('_');
        if (parts.length > 0) this.orderId = +parts[0];
      }

      this.route.parent?.paramMap.subscribe(params => {
        const storeIdParam = params.get('storeId');
        if (storeIdParam) {
          this.storeId = +storeIdParam;
        }
      });

      this.getStoreDetail(Number(this.storeId));


      const token = this.tokenService.getToken();
      if (this.staffId) {
        this.userService.getUserDetail(token).subscribe({
          next: (data) => {
            this.staffDetail = data; // Lưu thông tin người dùng vào biến
          },
          error: (err) => {
            console.error('Lỗi khi lấy thông tin người dùng:', err);
          }
        });
      }

      await this.fetchApiCart();
      await this.loadProductDetails();
      this.calculateTotals();
      this.printReceipt();

      if (this.isSuccess) {
        this.clearCart();
        localStorage.removeItem('staffId');
      }
    })();
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
  ngAfterViewInit(): void {}

  // verifyStoreMoMo(params: any) {
  //   console.log("📤 [MoMo STORE] Xác thực giao dịch tại cửa hàng:", params);
  //
  //   this.isLoading = true;
  //
  //   this.http.post(`http://localhost:8080/api/v1/momo/store/callback`, params, {
  //     responseType: 'arraybuffer',
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //   }).subscribe({
  //     next: (res: any) => {
  //       console.log("✅ [MoMo STORE] Giao dịch thành công:", res);
  //       this.isLoading = false;
  //       this.isSuccess = true;
  //
  //       this.clearCart(); // Nếu thành công, xóa cart nhân viên
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error("❌ [MoMo STORE] Lỗi xác thực:", err);
  //       this.isLoading = false;
  //       this.isSuccess = false;
  //     }
  //   });
  // }

  clearCart(): void {
    this.cartService.clearCart(this.staffId, "").subscribe({
      next: () => {
        console.log("🛒 Đã xóa giỏ hàng nhân viên sau giao dịch MoMo thành công.");
      },
      error: (err) => {
        console.error("⚠️ Lỗi khi xóa giỏ hàng:", err);
      }
    });
  }

  getProductDetailByProductVariantId(productVariantId: number): ProductVariantDetailDTO {
    if (!this.dataProductDetail || !Array.isArray(this.dataProductDetail)) {
      return {} as ProductVariantDetailDTO; // Trả về một object rỗng thay vì null
    }
    return this.dataProductDetail.find(item => item.id === productVariantId) ?? ({} as ProductVariantDetailDTO);
  }

  calculateTotals() {
    if (this.dataCart) {
      this.totalPrice = this.dataCart.totalPrice || 0;
      this.vat = this.totalPrice * 0.08; // Thuế VAT 8%

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
  getDataCart(userId: number, sessionId: string): Observable<CartDTO | null> {
    return this.cartService.getAllCart(userId, sessionId).pipe(
      map((response: ApiResponse<CartDTO>) => response.data || null),
      catchError((error) => {
        console.error("Lỗi khi gọi API getDataCart:", error);
        return of(null);
      })
    );
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



  async printReceipt(): Promise<void>  {
    if (!this.orderId) {
      console.error('Order not found');
      return;
    }

    const storeInfo = `
    <div style="text-align: center; font-family: monospace; margin-bottom: 20px">
      <h2>BRAND</h2>
     <p style="margin-top: 5px"><b></b> #${this.orderId}</p>
     <p style="margin-top: 5px"><b></b> ${new Date().toLocaleString()}</p>
       <p style="margin-top: 5px">${this.store?.name}</p>
      <p style="margin-top: 5px">${this.store?.fullAddress}</p>
      <p style="margin-top: 5px">${this.store?.email}</p>
    </div>
  `;

    let itemsHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr>
      <th style="text-align: left; width: 10%;">SP</th>
      <th style="text-align: left; width: 40%;">Tên sản phẩm</th>
      <th style="text-align: right; width: 10%;">SL</th>
      <th style="text-align: right; width: 40%;">Giá</th>
    </tr>
    <tr><td colspan="4" style="border-bottom: 1px dashed #000;"></td></tr>
  `;

    let totalBeforeVAT = 0;

    this.cartItems.forEach(item => {
      const product = this.getProductDetailByProductVariantId(item.productVariantId);
      const itemTotal = item.quantity * product.salePrice;
      totalBeforeVAT += itemTotal;

      itemsHtml += `
        <tr>
      <td style="white-space: nowrap;">${item.productVariantId}</td>
      <td style="white-space: nowrap; padding-right: 5px;">${product.name}</td>
      <td style="text-align: right; ">x${item.quantity}</td>
      <td style="text-align: right;">${itemTotal.toLocaleString()}</td>
       </tr>
    `;
    });

    itemsHtml += '<tr><td colspan="4" style="border-bottom: 1px dashed #000;"></td></tr>';
    itemsHtml += '<tr>' +
      '<td colspan="2" style="font-weight: bold; font-size: 15px">Tổng cộng</td>' +
      `<td style="text-align: right; font-weight: bold; font-size: 15px"">${this.totalCartItems}</td>` +
      `<td style="text-align: right; font-weight: bold; font-size: 15px"">${this.totalPrice.toLocaleString()}</td>` +
      '</tr>';

    itemsHtml += '<tr>' +
      '<td colspan="3" style="font-size: 15px">VAT (10%)</td>' +
      `<td style="text-align: right;  font-size: 15px"">${this.vat.toLocaleString()}</td>` +
      '</tr>';

    if (this.couponDetails) {
      itemsHtml += '<tr>' +
        '<td colspan="3" style="font-size: 15px">Giảm giá</td>' +
        `<td style="text-align: right; font-size: 15px; color: red;">- ${this.discountAmount.toLocaleString()}</td>` +
        '</tr>';
    }

    itemsHtml += '<tr><td colspan="4" style="border-bottom: 1px dashed #000;"></td></tr>';

    itemsHtml += '<tr>' +
      '<td colspan="3" style="font-size: 16px; font-weight: bold; ">TỔNG HÓA ĐƠN</td>' +
      `<td style="text-align: right; font-weight: bold; font-size: 16px"">${this.orderTotal.toLocaleString()}</td>` +
      '</tr></table>';

    const totals = `
    <div style="margin-top: 20px; font-size: 14px;">

      <p><b>Bạn được phục vụ bởi: ${this.staffDetail.lastName} || ID ${this.staffId}</b></p>
    </div>
  `;

    const qrCodeDataUrl = await this.generateQRCode(String(this.orderId));
    const receiptHtml = `
    <html>
    <head>
      <title>Hóa Đơn</title>
      <style>
        @media print {
          body {
            width: 80mm;
            font-family: monospace;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
            p {
      margin: 2px 0; /* Giảm khoảng cách giữa các dòng */
      line-height: 1.2; /* Giảm chiều cao dòng */
            }
          th, td {
            padding: 5px 0;
          }
          .total {
            font-size: 16px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
          }
          .receipt-container {
  border: 1px solid black; /* Viền đen 1px */
  padding: 10px; /* Thêm khoảng cách bên trong */
}
        }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="receipt-container">
        ${storeInfo}
        ${itemsHtml}
        ${totals}
        <p class="footer">
          <br>
            <p style="font-size: 14px; font-weight: bold;">Cảm ơn ${this.customerName ? this.customerName : 'Quý khách'} đã mua hàng!</p>
  <p style="font-size: 13px; color: #555;">Hẹn gặp lại quý khách.</p>
       <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #000;">
  <img src="${qrCodeDataUrl}" width="120" height="120" style="margin-top: 10px;">
</div>
        </p>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
  }

  async generateQRCode(orderId: string): Promise<string> {
    try {
      return await QRCode.toDataURL(orderId);
    } catch (error) {
      console.error('Lỗi khi tạo mã QR:', error);
      return '';
    }
  }

  getStoreDetail(storeId: number): void {
    this.storeService.getStoreDetail(storeId).subscribe(
      (response) => {
        if (response?.data) {
          this.store = response.data;
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu cửa hàng:', error);
      }
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
}
