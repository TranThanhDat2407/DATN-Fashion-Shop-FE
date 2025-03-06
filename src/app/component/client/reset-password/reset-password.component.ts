import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {ForgotPasswordService} from '../../../services/forgot-password/forgot-password.service';
import {FormsModule, NgForm} from '@angular/forms';
import {NgIf} from '@angular/common';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {MatDialog} from '@angular/material/dialog';
import {
  ModalResetPasswordSuccessComponent
} from '../Modal-notify/modal-reset-password-success/modal-reset-password-success.component';
import {
  ModalResetPasswordFailComponent
} from '../Modal-notify/modal-reset-password-fail/modal-reset-password-fail.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterLink
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
    private dialog: MatDialog,
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
        this.dialog.open(ModalResetPasswordSuccessComponent)
        this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]);
      },
      error: (error) => {
        this.dialog.open(ModalResetPasswordFailComponent)
        console.error('Đã xảy ra lỗi:', error);
      }
    });
  }
}
