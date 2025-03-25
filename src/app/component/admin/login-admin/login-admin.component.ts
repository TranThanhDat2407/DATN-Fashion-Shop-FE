import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {UserService} from '../../../services/user/user.service';
import {TokenService} from '../../../services/token/token.service';
import {RoleService} from '../../../services/role/role.service';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../../../services/Auth/auth.service';
import {ModalService} from '../../../services/Modal/modal.service';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {CookieService} from 'ngx-cookie-service';
import {CartService} from '../../../services/client/CartService/cart.service';
import {SessionService} from '../../../services/session/session.service';
import {Role} from '../../../models/role';
import {UserResponse} from '../../../dto/Response/user/user.response';
import {LoginDTO} from '../../../dto/user/login.dto';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [TranslateModule,CommonModule,FormsModule,RouterLink],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.scss'
})
export class LoginAdminComponent implements OnInit{
  constructor(private router: Router,
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
              private sessionService: SessionService) {
  }

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  roles: Role[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: Role | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse
  qtyTotal: number = 0;

  sessionId?: string;
  userId?: number;


  async ngOnInit(): Promise<void> {

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

  onLoginSuccess() {

    // Cập nhật trạng thái đăng nhập
    this.authService.setLoginStatus(true);

    if (this.authService.getReturnUrl() === '/') {
      this.authService.setReturnUrl(`/admin/dashboard`)
    }

    // Điều hướng đến trang trước đó
    this.userId = this.tokenService.getUserId();
    this.sessionId = this.sessionService.getSession()
    this.cartService.mergeCart(this.userId ?? 0, this.sessionId ?? '').subscribe(response => {
      console.log(`response : `, response)
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
      role_id: this.selectedRole?.id ?? 1
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

}
