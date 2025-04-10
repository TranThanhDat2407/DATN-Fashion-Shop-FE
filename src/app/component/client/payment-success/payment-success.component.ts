import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import {firstValueFrom, take} from 'rxjs';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

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
  selector: 'app-payment-success',
  standalone: true,
  imports: [NgClass, CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  paymentData: any = {};
  isSuccess: boolean = false;
  currentLang: string = '';
  currentCurrency: string = '';
  userId: any = null;
  isLoading: boolean = true;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private http: HttpClient
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);


    this.route.queryParams.pipe(take(1)).subscribe(params => {

      this.paymentData = params;
      this.verifyPayment(params);
    });
  }

  getUserInfo(): number | null {
    const userData = localStorage.getItem('user_info');
    if (!userData) return null;

    const user = JSON.parse(userData);
    console.log("📌 user_info từ localStorage:", user);

    return user.id ?? null;
  }


  formatCurrency(amount: any): string {
    if (!amount) return '0 VND';

    let amountNumber = Number(amount); // Chuyển đổi về số

    if (isNaN(amountNumber)) {
      console.error("⚠ Lỗi: Giá trị amount không hợp lệ:", amount);
      return '0 VND';
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amountNumber / 100);
  }


  getStatusText(status: string): string {
    return status === '00' ? 'Giao dịch thành công' : 'Giao dịch thất bại';
  }

  clearCart(userId: number | null, sessionId: string | null): void {
    console.log("🛒 Đang gọi API xóa giỏ hàng...");
    console.log("🔍 UserId:", userId);

    if (!userId && !sessionId) {
      console.error("⚠ Không có userId hoặc sessionId, không thể xóa giỏ hàng!");
      return;
    }

    const params: any = {};
    if (userId) params.userId = userId;
    if (sessionId) params.sessionId = sessionId;

    this.http.delete(`http://localhost:8080/api/v1/cart/clear`, {params}).subscribe({
      next: () => console.log('✅ Giỏ hàng đã được xóa thành công!'),
      error: (err) => {
        console.error('⚠ Lỗi khi xóa giỏ hàng:', err);
        alert("Không thể xóa giỏ hàng, vui lòng thử lại!");
      }
    });
  }

  verifyPayment(vnpParams: any) {
    console.log("📤 [VNPay] Bắt đầu xác thực thanh toán:", vnpParams);

    this.isLoading = true; // Hiển thị trạng thái loading trước khi gửi yêu cầu

    this.http.post<OrderResponse>('http://localhost:8080/api/v1/orders/return', vnpParams, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).subscribe({
      next: (res) => {
        console.log("✅ [VNPay] Giao dịch hợp lệ:", res);
        // vnpParams.vnp_ResponseCode === "00" && vnpParams.vnp_TransactionStatus === "00"
        this.isSuccess = res.orderStatusName === "PROCESSING";
        this.isLoading = false;

        if (this.isSuccess) {
          this.userId = this.getUserInfo();
          const sessionId = localStorage.getItem('sessionId') || null;

          if (this.userId) {
            this.clearCart(this.userId, sessionId);
          }
        } else {
          console.warn("⚠ Giao dịch không thành công, không xóa giỏ hàng.");
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("⚠ Lỗi khi xác thực giao dịch:", err);
        this.isSuccess = false;
        this.isLoading = false; // Tắt trạng thái loading dù có lỗi
      }
    });
  }
}
