import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {FormsModule, NgForm} from '@angular/forms';
import {NgIf} from '@angular/common';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {RegisterDTO} from '../../../dto/user/register.dto';
import {UserService} from '../../../services/user/user.service';
import {debounceTime, distinctUntilChanged, Subject, switchMap} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {ModalRegisterSuccessComponent} from '../Modal-notify/modal-register-success/modal-register-success.component';
import {ModalRegisterFailComponent} from '../Modal-notify/modal-register-fail/modal-register-fail.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, NgIf, CommonModule, FormsModule, TranslateModule, ModalRegisterSuccessComponent],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit{
  constructor(private navigationService: NavigationService,
              private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private dialog: MatDialog,
              private cdRef: ChangeDetectorRef,
              )
  {
  }

  notifyError: boolean = false
  notifySuccsess: boolean = false

  lastName = '';
  firstName = '';
  phone = '';
  email = '';
  password = '';
  retypePassword = '';
  gender = 'Nam'; // Mặc định Nam
  dateOfBirth = '';
  passwordMismatch = false;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  emailExists = false;
  phoneExists = false;

  private emailCheck$ = new Subject<string>();
  private phoneCheck$ = new Subject<string>();


  ngOnInit() {
    this.emailCheck$.pipe(
      debounceTime(500), // Giảm số lần gọi API
      distinctUntilChanged(),
      switchMap(email => this.userService.checkEmail(email))
    ).subscribe(exists => {
      this.emailExists = exists;
    });

    this.phoneCheck$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(phone => this.userService.checkPhone(phone))
    ).subscribe(exists => {
      this.phoneExists = exists;
    });
  }

  checkEmail() {
    if (this.email) {
      this.emailCheck$.next(this.email);
    }
  }

  checkPhone() {
    if (this.phone) {
      this.phoneCheck$.next(this.phone);
    }
  }

  checkPasswordMatch() {
    console.log(this.passwordMismatch)
    this.passwordMismatch = this.password !== this.retypePassword;
    this.cdRef.detectChanges();
  }

  onSubmit(form: NgForm) {
    if (form.invalid || this.passwordMismatch || this.emailExists || this.phoneExists) {

      return;
    }

    // Chuyển đổi dateOfBirth về định dạng ISO 8601
    const formattedDate = new Date(this.dateOfBirth).toISOString();

    const userData = new RegisterDTO({
      first_name: this.firstName,
      last_name: this.lastName,
      phone: this.phone,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
      gender: this.gender,
      dateOfBirth: formattedDate
    });

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';


    this.userService.register(userData).subscribe({
      next: (response) => {

        this.notifySuccsess = false;
        setTimeout(() => {
          this.notifySuccsess = true;
        }, 100);

        form.resetForm();
      },
      error: (error) => {
        this.dialog.open(ModalRegisterFailComponent)
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  dobError: string | null = null;

  validateDateOfBirth() {
    if (!this.dateOfBirth) {
      this.dobError = "Vui lòng chọn ngày sinh.";
      return;
    }

    const dob = new Date(this.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    // Điều chỉnh tuổi nếu chưa qua sinh nhật năm nay
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (dob > today) {
      this.dobError = "Ngày sinh không thể lớn hơn ngày hiện tại.";
    } else if (age < 15) {
      this.dobError = "Bạn phải đủ 15 tuổi.";
    } else {
      this.dobError = null;
    }
  }
}
