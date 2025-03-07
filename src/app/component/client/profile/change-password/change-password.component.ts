import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../../services/user/user.service';
import {TokenService} from '../../../../services/token/token.service';
import {Router} from '@angular/router';
import {NavigationService} from '../../../../services/Navigation/navigation.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {
  ModalNotifyChangePassSuccessComponent
} from '../../Modal-notify/modal-notify-change-pass-success/modal-notify-change-pass-success.component';
import { TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    TranslateModule,
    NgClass
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit{
  userId: number = 0; // Lấy từ user session hoặc input
  currentPassword: string = '';
  newPassword: string = '';
  retypePassword: string = '';
  message: string = '';

  currentLang: string = '';
  currentCurrency: string = '';

  showPassword: boolean = false
  passwordMismatch: boolean = false;
  showCurrentPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }
  constructor(private authService: UserService,
              private tokenService: TokenService,
              private router: Router,
              private navigationService: NavigationService,
              private dialog: MatDialog,
  ) {}

  onChangePassword() {
    if (!this.currentPassword || !this.newPassword || !this.retypePassword) {
      this.message = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }

    if (this.newPassword !== this.retypePassword) {
      this.message = 'Mật khẩu mới không khớp.';
      return;
    }

    this.authService.changePassword(this.userId, this.currentPassword, this.newPassword, this.retypePassword)
      .subscribe({
        next: (res) => {
          this.dialog.open(ModalNotifyChangePassSuccessComponent);
          setTimeout(() => {
            this.tokenService.removeToken();
            this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]);
          }, 3000);
        },
        error: (err) => {
          this.message = 'Có lỗi xảy ra, vui lòng thử lại.';
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

    this.userId = this.tokenService.getUserId();
  }

  validateRetypePassword() {
    this.passwordMismatch = this.newPassword !== this.retypePassword;
  }
}
