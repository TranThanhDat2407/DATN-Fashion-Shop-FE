import {Component, OnInit, ViewChild} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ForgotPasswordService} from '../../../services/forgot-password/forgot-password.service';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {response} from 'express';
import {error} from 'console';
import {MatDialog} from '@angular/material/dialog';
import {ModalOtpSuccessComponent} from '../Modal-notify/modal-otp-success/modal-otp-success.component';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss'
})
export class OTPComponent implements OnInit {
  @ViewChild('OtpForm') forgotPasswordForm!: NgForm;
  otp: string = '';
  email: string = '';
  errorMessage: string = '';

  currentLang: string = '';
  currentCurrency: string = '';


  constructor(
    private activatedRoute: ActivatedRoute,
    private forgotPasswordService: ForgotPasswordService,
    private router: Router,
    private dialog: MatDialog,
    private navigationService: NavigationService,
  ) {
    // Lấy email từ query params
    this.email = this.activatedRoute.snapshot.queryParams['email'];
  }

  onSubmit(): void {
    if (!this.otp || this.otp.length < 4) {
      this.errorMessage = 'Vui lòng nhập mã OTP hợp lệ.';
      return;
    }

    // Gọi API xác thực OTP
    this.forgotPasswordService.verifyOtp(this.email, this.otp).subscribe({
      next: () => {
        console.log('Xác thực OTP thành công');

        // Điều hướng sang trang reset-password
        this.router.navigate(
          [`/client/${this.currentCurrency}/${this.currentLang}/reset-password/${this.email}`]
        );
      },
      error: (error) => {
        console.error('Lỗi xác thực OTP:', error);
        this.errorMessage = error.error?.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.';
      }
    });
  }

  ngOnInit(): void {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });
  }

  sendOtpAgain(){
    // Gọi API để gửi OTP qua email
    console.log(this.email);
    this.forgotPasswordService.forgotPassword(this.email).subscribe({

      next: (response) => {
        console.log(response);
        this.dialog.open(ModalOtpSuccessComponent)
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
