import {Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from '../../header-admin/header-admin.component';
import {NgIf} from '@angular/common';
import {TableComponent} from '../../table/table.component';
import {CouponService} from '../../../../services/client/CouponService/coupon-service.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, Subject, switchMap} from 'rxjs';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {UserService} from '../../../../services/user/user.service';
import {UserAdminResponse} from '../../../../dto/user/userAdminResponse.dto';

@Component({
  selector: 'app-list-coupon',
  standalone: true,
  imports: [HeaderAdminComponent, NgIf, TableComponent, FormsModule, MatInputModule, ReactiveFormsModule, MatAutocompleteModule],
  templateUrl: './list-coupon.component.html',
  styleUrl: './list-coupon.component.scss'
})
export class ListCouponComponent implements OnInit {
  coupons: any = { content: [], totalPages: 0, totalElements: 0 };
  currentPage = 1;
  itemsPerPage = 10;
  sortBy = 'createdAt';
  sortDirection = 'asc';
  searchKeyword = '';
  userSearchCtrl = new FormControl('');
  filteredUsers: UserAdminResponse[] = [];

  // Biến tìm kiếm
  searchCode: string = '';
  searchExpirationDate: string = '';
  searchDiscountValue: number | undefined = undefined;
  searchMinOrderValue: number | undefined = undefined;
  searchLanguageCode: string = '';

  constructor(private couponService: CouponService,
              private userService: UserService) {}
  private searchKeywordChanged = new Subject<string>();
  ngOnInit(): void {
    this.loadCoupons();
    this.searchKeywordChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.searchKeyword = keyword;
      this.loadCoupons();
    });
    this.userService.searchUsers('').subscribe(
      users => {
        console.log('📌 Danh sách user từ API:', users); // Log danh sách user lấy từ API
        this.filteredUsers = users; // Lưu danh sách vào biến filteredUsers
      },
      error => {
        console.error('❌ Lỗi khi lấy danh sách user:', error); // Log nếu API lỗi
      }
    );

    // // Xử lý tìm kiếm khi nhập vào ô input
    // this.userSearchCtrl.valueChanges
    //   .pipe(
    //     startWith(''), // Mặc định hiển thị toàn bộ danh sách user
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     switchMap(value => this.userService.searchUsers(value ?? '')) // Gọi API tìm kiếm user
    //   )
    //   .subscribe(users => {
    //     this.filteredUsers = users;
    //   });

  }
  loadCoupons() {
    console.log('🔎 Searching with keyword:', this.searchKeyword);
    this.couponService
      .searchCoupons(
        this.searchKeyword,
        this.currentPage - 1,
        this.itemsPerPage,
        this.sortBy,
        this.sortDirection
      )
      .subscribe(
        response => {
          console.log('✅ API Response:', response);
          this.coupons = response?.data || { content: [], totalPages: 0, totalElements: 0 };
        },
        error => {
          console.error('❌ Error fetching coupons:', error);
          this.coupons = { content: [], totalPages: 0, totalElements: 0 };
        }
      );
  }

  onSearch() {
    this.searchKeywordChanged.next(this.searchKeyword);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCoupons();
  }
  onUserSelected(user: UserAdminResponse) {
    console.log('User đã chọn:', user);
  }


}
