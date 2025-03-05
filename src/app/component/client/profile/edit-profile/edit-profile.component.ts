import {Component, OnInit} from '@angular/core';
import {TokenService} from '../../../../services/token/token.service';
import {UserService} from '../../../../services/user/user.service';
import {NgxBarcode6Module} from 'ngx-barcode6';
import {UserDetailDTO} from '../../../../dto/UserDetailDTO';
import {FormsModule} from '@angular/forms';
import {UpdateUserDTO} from '../../../../dto/user/update.user.dto';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {NavigationService} from '../../../../services/Navigation/navigation.service';
import {debounceTime, distinctUntilChanged, Subject, switchMap} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../../services/Auth/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    NgxBarcode6Module,
    FormsModule,
    NgIf,
    TranslatePipe
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit{
  userDetail!: UserDetailDTO; // Sử dụng "!" để tránh lỗi undefined
  isLoading = true;
  errorMessage: string | null = null;
  protected readonly String = String;

  currentLang: string = '';
  currentCurrency: string = '';

  emailError: string | null = null;
  phoneError: string | null = null;

  emailExists = false;
  phoneExists = false;

  private emailCheck$ = new Subject<string>();
  private phoneCheck$ = new Subject<string>();

  originalEmail: string = '';
  originalPhone: string = '';

  updateEmail: boolean = false;
  constructor(private tokenService: TokenService,
              private userService: UserService,
              private router: Router,
              private navigationService: NavigationService,
              private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    this.getUserDetails();

    // Kiểm tra email tồn tại (trừ khi người dùng nhập lại email cũ)
    this.emailCheck$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(email => email !== this.originalEmail ? this.userService.checkEmail(email) : [false])
    ).subscribe(exists => {
      this.emailExists = exists;
    });

    // Kiểm tra số điện thoại tồn tại (trừ khi người dùng nhập lại số cũ)
    this.phoneCheck$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(phone => phone !== this.originalPhone ? this.userService.checkPhone(phone) : [false])
    ).subscribe(exists => {
      this.phoneExists = exists;
    });
  }

  getUserDetails(): void {
    const token = this.tokenService.getToken(); // Lấy token từ service
    if (!token) {
      this.errorMessage = "Không tìm thấy token đăng nhập.";
      this.isLoading = false;
      return;
    }

    this.userService.getUserDetail(token).subscribe({
      next: (user: UserDetailDTO) => {
        this.userDetail = user;
        this.userDetail.dateOfBirth = this.formatDateOfBirth(user.dateOfBirth);

        // Lưu email và số điện thoại gốc
        this.originalEmail = user.email;
        this.originalPhone = user.phone;


        this.isLoading = false;
        console.log("User Detail:", this.userDetail);
      },
      error: (error) => {
        this.errorMessage = error.message || "Lỗi khi tải thông tin người dùng.";
        this.isLoading = false;
      }
    });

  }



  onUpdateProfile(): void {
    if (!this.userDetail) {
      console.error("Không tìm thấy thông tin user");
      return;
    }

    const formattedDate = this.convertToISO8601(this.userDetail.dateOfBirth);

    const updatedUserData: UpdateUserDTO = {
      first_name: this.userDetail.firstName.trim(),
      last_name: this.userDetail.lastName.trim(),
      phone: this.userDetail.phone.trim(),
      email: this.userDetail.email.trim(),
      date_of_birth: formattedDate,
      gender: this.userDetail.gender,
      is_active: this.userDetail.is_active
    };

    console.log("Dữ liệu gửi đi:", updatedUserData);

    this.userService.updateUser(this.tokenService.getUserId(), updatedUserData).subscribe({
      next: (response) => {
        if(this.updateEmail){
          this.authService.setReturnUrl(this.router.url);
          this.logout()
        }else {
          this.getUserDetails();
        }
      },
      error: (error) => {
        console.error("Lỗi cập nhật:", error);
        alert("Cập nhật thất bại, vui lòng thử lại.");
      }
    });


  }


  formatDateOfBirth(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", dateString);
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo luôn có 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  convertToISO8601(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('/');
    if (parts.length !== 3) {
      console.error("Định dạng ngày không hợp lệ:", dateString);
      return '';
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day).toISOString();
  }


  // onInputChange(field: keyof UserDetailDTO, value: string): void {
  //   if (!this.userDetail) return;
  //
  //   // Truy cập thuộc tính động của object đúng cách
  //   (this.userDetail as any)[field] = value.trim();
  //
  //   console.log(`Cập nhật ${field}:`, this.userDetail[field]);
  // }

  /** ✅ Kiểm tra email hợp lệ & kiểm tra tồn tại */
  validateEmail(): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.userDetail.email)) {
      this.emailError = "Email không hợp lệ.";
      return;
    } else {
      this.emailError = null;
      if (this.userDetail.email !== this.originalEmail) {
        this.emailCheck$.next(this.userDetail.email);
      } else {
        this.emailExists = false; // Nếu nhập lại email ban đầu, không cần kiểm tra
      }
    }
  }

  /** ✅ Kiểm tra số điện thoại hợp lệ & kiểm tra tồn tại */
  validatePhone(): void {
    const phoneRegex = /^0(3[2-9]|5[2-9]|7[0|6-9]|8[1-9]|9[0-9])\d{7}$/;
    if (!phoneRegex.test(this.userDetail.phone)) {
      this.phoneError = "Số điện thoại không hợp lệ.";
      return;
    } else {
      this.phoneError = null;
      if (this.userDetail.phone !== this.originalPhone) {
        this.phoneCheck$.next(this.userDetail.phone);
      } else {
        this.phoneExists = false; // Nếu nhập lại số điện thoại ban đầu, không cần kiểm tra
      }
    }
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]);
  }

  onUpdateEmail(){
    this.updateEmail = !this.updateEmail;
    // Nếu checkbox bị bỏ chọn, đặt lại email ban đầu
    if (!this.updateEmail) {
      this.userDetail.email = this.originalEmail;
      this.emailError = null;  // Xóa lỗi nếu có
      this.emailExists = false; // Xóa thông báo email đã tồn tại
    }
  }


}
