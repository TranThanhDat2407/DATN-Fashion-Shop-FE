import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { Role } from '../../../models/role';
import { UserService } from '../../../services/user/user.service';
import { TokenService } from '../../../services/token/token.service';
import { RoleService } from '../../../services/role/role.service';
import { UserResponse } from '../../../dto/Response/user/user.response';
import { LoginDTO } from '../../../dto/user/login.dto';
import { LoginResponse } from '../../../dto/Response/user/login.response';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ModalNotifyLoginComponent } from '../Modal-notify/modal-notify-login/modal-notify-login.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/Auth/auth.service';
import { ModalService } from '../../../services/Modal/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../../services/client/CartService/cart.service';
import { TotalQty } from '../../../dto/TotalQty';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { response } from 'express';
import { SessionService } from '../../../services/session/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, TranslateModule, FormsModule, NgIf, ModalNotifyLoginComponent],
  providers: [CookieService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = ''; // Thêm biến lưu lỗi

  currentLang: string = '';
  currentCurrency: string = '';

  roles: Role[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: Role | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse
  qtyTotal: number = 0;

  sessionId?: string;
  userId?: number;

  onEmailChange() {
    console.log(`Email typed: ${this.email}`);
    //how to validate ? phone must be at least 6 characters
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private toastr: ToastrService,
    private authService: AuthService,
    private modalService: ModalService,
    private navigationService: NavigationService,
    private cookieService: CookieService,
    private cartService: CartService,
    private sessionService: SessionService


  ) {
    // this.sessionId = this.cookieService.get('SESSION_ID') || '';

  }

  async ngOnInit(): Promise<void> {

    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => { // Sử dụng kiểu Role[]

        this.roles = roles;
        this.selectedRole = roles.length > 0 ? roles[0] : undefined;
      },
      complete: () => {

      },
      error: (error: any) => {

        console.error('Error getting roles:', error);
      }
    });
    this.userId = this.tokenService.getUserId() ?? 0;

    this.activatedRoute.queryParams.subscribe((params) => {
      this.errorMessage = params['error'] || null;
    });

  }

  mergeCard(userId: number, sessionId: string) {
    this.cartService.mergeCart(userId, sessionId).subscribe({
      next: (response) => {
        console.log("Merge cart success:", response);

        // Xử lý logic sau khi merge thành công, ví dụ cập nhật giỏ hàng
      },
      error: (error) => {
        console.error("Error merging cart:", error);
        // Xử lý lỗi, có thể hiển thị thông báo lỗi cho người dùng
      }
    });
  }


  onLoginSuccess() {

    // Cập nhật trạng thái đăng nhập
    this.authService.setLoginStatus(true);

    // Đóng modal login
    this.modalService.closeLoginModal();

    if (this.authService.getReturnUrl() === '/') {
      this.authService.setReturnUrl(`/client/${this.currentCurrency}/${this.currentLang}`)
    }

    // Điều hướng đến trang trước đó
    this.userId = this.tokenService.getUserId();
    this.sessionId = this.sessionService.getSession()
    this.cartService.mergeCart(this.userId ?? 0, this.sessionId ?? '').subscribe(response => {
      console.log(`response : `, response)
    })
    console.log('object : ' + this.userId)
    this.cartService.clearCart(0, this.sessionId ?? '').subscribe(response => {
      console.log('xoa cart thanh cong')
    })

    const sessionId = this.sessionService.getSession();
    this.cartService.getQtyCart(this.userId ?? 0 , sessionId ?? '');
    const returnUrl = this.authService.getReturnUrl();
    this.router.navigateByUrl(returnUrl);
  }

  login() {
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
      role_id: this.selectedRole?.id ?? 2
    };

    this.userService.login(loginDTO).subscribe({
      next: (data) => {
        console.log('Login Response:', data);
        // this.cartService.mergeCart(data.)
        this.onLoginSuccess()
        const token = data.data.token;
        const roles = data.data.roles;

        if (!token) {
          this.errorMessage = 'Không nhận được token từ server.';
          return;
        }

        // Lưu token vào service quản lý token
        this.tokenService.setToken(token);

        // Điều hướng dựa vào vai trò người dùng
        // if (roles.includes('ROLE_ADMIN')) {
        //   this.router.navigate(['/admin']);
        // } else {
        //   this.router.navigate(['/']);
        // }
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Email hoặc mật khẩu không đúng';
        this.toastr.error('Email hoặc mật khẩu không đúng', 'ERROR', { timeOut: 2000 })
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  // Hàm đăng nhập với Google (placeholder)
  loginWithGoogle() {
    console.log('Login with Google clicked');
    // Bổ sung logic Google OAuth2 sau này
  }

}
