import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  message = 'Đang xác thực tài khoản...';
  isSuccess = false;

  currentLang: string = '';
  currentCurrency: string = '';

  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private router: Router,
              private navigationService: NavigationService,
              ) {}

  ngOnInit() {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });


    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.http.get(`http://localhost:8080/api/v1/users/register/verify?token=${token}`).subscribe(
          () => {
            this.message = 'Xác thực thành công! Bạn có thể đăng nhập.';
            this.isSuccess = true;
            setTimeout(() => this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]), 2000); // Chuyển hướng sau 3s
          },
          () => {
            this.message = 'Token không hợp lệ hoặc đã hết hạn!';
            this.isSuccess = false;
          }
        );
      } else {
        this.message = 'Không tìm thấy token!';
      }
    });
  }
}
