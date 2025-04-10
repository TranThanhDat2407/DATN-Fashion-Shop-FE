import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {PaypalService} from '../../../services/paypal/paypal.service';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-paypal-success',
  standalone: true,
  imports: [
    RouterLink,
    NgIf
  ],
  templateUrl: './paypal-success.component.html',
  styleUrl: './paypal-success.component.scss'
})
export class PaypalSuccessComponent implements OnInit {

  message: string = '';
  isLoading: boolean = true;
  private hasCaptured: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paypal: PaypalService
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const payerId = this.route.snapshot.queryParamMap.get('PayerID');

    console.log('📥 Token nhận từ URL:', token);

    if (token && payerId && !this.hasCaptured) {
      this.hasCaptured = true; // Đánh dấu đã gọi capture
      this.isLoading = false;

      this.paypal.captureOrder(token).subscribe({
        next: (res: any) => {
          console.log('🎯 Phản hồi từ BE:', res);

            this.message = '🎉 Thanh toán thành công!';
        },
        error: (err) => {
          this.message = '❌ Thanh toán thất bại!';
          console.error('❌ Capture BE thất bại:', err);
        }
      });
    } else {
      this.message = '❌ Thiếu token hoặc đã xử lý xong.';
    }
  }
}
