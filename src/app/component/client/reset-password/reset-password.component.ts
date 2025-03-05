import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {ForgotPasswordService} from '../../../services/forgot-password/forgot-password.service';
import {FormsModule, NgForm} from '@angular/forms';
import {NgIf} from '@angular/common';
import {NavigationService} from '../../../services/Navigation/navigation.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit{
  @ViewChild('resetPasswordForm') resetPasswordForm!: NgForm;
  newPassword: string = '';
  confirmPassword: string = '';
  passwordsDoNotMatch: boolean = false;

  email: string = '';

  currentLang: string = '';
  currentCurrency: string = '';

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    // Lấy email từ URL
    this.activatedRoute.params.subscribe(params => {
      this.email = params['email'];
    });

    // Lấy thông tin ngôn ngữ & tiền tệ nếu cần
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });
  }

  /** ✅ Kiểm tra mật khẩu nhập lại có khớp không */
  checkPasswordMatch(): void {
    this.passwordsDoNotMatch = this.newPassword !== this.confirmPassword;
  }

  /** ✅ Gửi yêu cầu đổi mật khẩu */
  onResetPassword() {
    // Kiểm tra mật khẩu có khớp không
    this.checkPasswordMatch();
    if (this.passwordsDoNotMatch) return;

    // Gọi API đổi mật khẩu
    this.forgotPasswordService.resetPassword(this.email, this.newPassword).subscribe({
      next: () => {
        alert('Mật khẩu của bạn đã được đặt lại thành công!');
        this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]);
      },
      error: (error) => {
        console.error('Đã xảy ra lỗi:', error);
        alert('Đặt lại mật khẩu không thành công. Vui lòng thử lại!');
      }
    });
  }
}
