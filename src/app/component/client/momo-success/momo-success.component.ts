import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {firstValueFrom, take} from 'rxjs';
import {NgIf} from '@angular/common';
interface OrderResponse {
  orderId: number;
  userId: number;
  couponId?: number | null;
  shippingMethodName: string;
  shippingAddress: string;
  paymentMethodName: string;
  orderStatusName: string;
}
@Component({
  selector: 'app-momo-success',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './momo-success.component.html',
  styleUrl: './momo-success.component.scss'
})


export class MomoSuccessComponent implements OnInit {
  paymentData: any = {};
  isSuccess: boolean | null = null;
  isLoading: boolean = false;
  userId: any = null;
  currentLang: string = '';
  currentCurrency: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {

    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);



    this.route.queryParams.pipe(take(1)).subscribe(params => {
      console.log("📥 [MoMo] Redirect với params:", params);
      this.paymentData = params;


      const resultCode = params['resultCode'];
      this.isSuccess = resultCode === '0';

      if (this.isSuccess) {
        this.userId = this.getUserInfo();
        const sessionId = localStorage.getItem('sessionId') || null;
        if (this.userId || sessionId) {
          this.clearCart(this.userId, sessionId);
        }
      }
    });

  }
  getUserInfo(): number | null {
    const userData = localStorage.getItem('user_info');
    return userData ? JSON.parse(userData).id ?? null : null;
  }




  // verifyMoMo(params: any) {
  //   console.log("📤 [MoMo] Bắt đầu xác thực thanh toán:", params);
  //
  //   this.isLoading = true;
  //
  //   this.http.post<OrderResponse>('http://localhost:8080/api/v1/momo/callback', params, {
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //   }).subscribe({
  //     next: (res) => {
  //       console.log("✅ [MoMo] Thanh toán thành công:", res);
  //       this.isLoading = false;
  //       this.handlePaymentResponse(res);
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error("❌ Lỗi xác thực MoMo:", err);
  //       this.isLoading = false;
  //       this.isSuccess = false;
  //     }
  //   });
  // }

  // private handlePaymentResponse(res: OrderResponse) {
  //   this.userId = this.getUserInfo();
  //   const sessionId = localStorage.getItem('sessionId') || null;
  //
  //   if (res.orderStatusName === "PROCESSING") {
  //     console.log("✅ Đơn hàng đang xử lý!");
  //     this.isSuccess = true;
  //
  //     if (this.userId) {
  //       this.clearCart(this.userId, sessionId);
  //     }
  //   } else {
  //     console.warn("⚠ Giao dịch thất bại hoặc bị hủy!");
  //     this.isSuccess = false;
  //   }
  // }
  // clearCart(userId: number | null, sessionId: string | null): void {
  //   if (!userId && !sessionId) {
  //     console.error("⚠ Không có userId hoặc sessionId, không thể xóa giỏ hàng!");
  //     return;
  //   }

  clearCart(userId: number | null, sessionId: string | null): void {
    if (!userId && !sessionId) {
      console.error("⚠ Không có userId hoặc sessionId, không thể xóa giỏ hàng!");
      return;
    }

    const params: any = {};
    if (userId) params.userId = userId;
    if (sessionId) params.sessionId = sessionId;

    this.http.delete(`http://localhost:8080/api/v1/cart/clear`, { params }).subscribe({
      next: () => console.log('✅ Giỏ hàng đã được xóa!'),
      error: (err) => console.error('⚠ Lỗi khi xóa giỏ hàng:', err)
    });
  }
}
