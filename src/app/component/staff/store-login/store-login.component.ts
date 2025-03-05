import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StoreService} from '../../../services/client/store/store.service';
import {ListStoreDTO} from '../../../dto/ListStoreDTO';
import {StaffLoginDto} from '../../../dto/staff/staff-login.dto';
import {StaffService} from '../../../services/staff/staff.service';
import {Role} from '../../../models/role';
import {ActivatedRoute, Router} from '@angular/router';
import {TokenService} from '../../../services/token/token.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-store-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './store-login.component.html',
  styleUrl: './store-login.component.scss'
})
export class StoreLoginComponent implements OnInit {

  stores: ListStoreDTO[] = [];
  filteredStores: any[] = [];
  showPassword: boolean = false;
  errorMessage: string = '';
  submitted = false;

  roles: Role[] = [];
  loginForm!: FormGroup; // FormGroup

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private staffService: StaffService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.fetchStores();

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)]],
      storeId: ['', Validators.required]
    });
  }

  fetchStores(): void {
    this.storeService.getStoresForLogin(0, 100, '').subscribe(response => {
      if (response?.data) {
        this.stores = response.data.content;
        this.filteredStores = [...this.stores];
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = decodeURIComponent(params['error']);
      }
    });
  }

  login() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const staffLoginDTO: StaffLoginDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      store_id: this.loginForm.value.storeId
    };

    this.staffService.login(staffLoginDTO).subscribe({
      next: (response: any) => {
        this.errorMessage = response.message
        if (response) {
          const token = response.data.token;
          const storeId = this.loginForm.value.storeId;

          this.tokenService.setToken(token);
          this.router.navigate([`/staff/${storeId}/dashboard`]);
          this.errorMessage = response.message

        } else {
          this.errorMessage = response.message
        }
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.errorMessage = error.message ;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Hàm hỗ trợ hiển thị lỗi
  hasError(controlName: string) {
    return this.submitted && this.loginForm.get(controlName)?.invalid;
  }
}
