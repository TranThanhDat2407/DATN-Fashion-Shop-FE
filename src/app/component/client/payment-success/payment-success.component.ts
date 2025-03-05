import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);

    this.route.queryParams.subscribe(params => {
      this.paymentData = params;
      const responseCode = params['vnp_ResponseCode']?.toString();
      const transactionStatus = params['vnp_TransactionStatus']?.toString();

      this.isSuccess = responseCode === '00' && transactionStatus === '00';

      if (this.isSuccess) {
        this.verifyPayment(params);
      }
    });
  }

  getUserInfo(): number | null {
    const userData = localStorage.getItem('user_info');
    if (!userData) return null;

    const user = JSON.parse(userData);
    console.log("📌 user_info từ localStorage:", user);

    return user.id ?? null;
  }


  formatCurrency(amount: string): string {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(amount) / 100);
  }

  getStatusText(status: string): string {
    return status === '00' ? 'Giao dịch thành công' : 'Giao dịch thất bại';
  }

  clearCart(userId: number | null, sessionId: string | null): void {
    console.log("🛒 Đang gọi API xóa giỏ hàng...");
    console.log("🔍 UserId:", userId);
    console.log("🔍 SessionId:", sessionId);

    if (!userId && !sessionId) {
      console.error("⚠ Không có userId hoặc sessionId, không thể xóa giỏ hàng!");
      return;
    }

    const params: any = {};
    if (userId) params.userId = userId;
    if (sessionId) params.sessionId = sessionId;

    this.http.delete(`http://localhost:8080/api/v1/cart/clear`, { params }).subscribe({
      next: () => console.log('✅ Giỏ hàng đã được xóa thành công!'),
      error: (err) => {
        console.error('⚠ Lỗi khi xóa giỏ hàng:', err);
        alert("Không thể xóa giỏ hàng, vui lòng thử lại!");
      }
    });
  }

  verifyPayment(vnpParams: any) {
    console.log("📤 Dữ liệu gửi lên backend:", vnpParams);


    this.http.post('http://localhost:8080/api/v1/orders/return', vnpParams)
      .subscribe({
      next: (res) => {
        console.log("✅ Giao dịch hợp lệ:", res);
        this.userId = this.getUserInfo();
        const sessionId = localStorage.getItem('sessionId') || null;
        if (this.userId) {
          this.clearCart(this.userId, sessionId);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.error && err.error.message) {
          console.error("⚠ Giao dịch không hợp lệ:", err.error.message);

        } else {
          console.error("⚠ Giao dịch không hợp lệ, lỗi không xác định:", err);
        }
      }
    });
  }




}
