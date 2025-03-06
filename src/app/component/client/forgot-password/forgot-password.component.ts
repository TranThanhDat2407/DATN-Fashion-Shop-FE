import {Component, OnInit, ViewChild} from '@angular/core';
import { RouterLink } from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {Router} from '@angular/router';
import {ForgotPasswordService} from '../../../services/forgot-password/forgot-password.service';
import {FormsModule, NgForm} from '@angular/forms';
import {response} from 'express';
import {error} from 'console';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule,CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit{
  @ViewChild('forgotPasswordForm') forgotPasswordForm!: NgForm;
  email: string = '';
  errorMessage: string = '';

  currentLang: string = ''; // Ngôn ngữ mặc định
  currentCurrency: string = '';

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private router: Router,
    private navigationService: NavigationService
  ) {}

  onSubmit() {
    // Gọi API để gửi OTP qua email
    console.log(this.email);
    this.forgotPasswordService.forgotPassword(this.email).subscribe({

      next: (response) => {
        console.log(response);
        // Chuyển đến bước tiếp theo (Xác thực OTP)
        this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/otp`], { queryParams: { email: this.email } });
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = error.error.message || 'Có lỗi xảy ra';
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

}
