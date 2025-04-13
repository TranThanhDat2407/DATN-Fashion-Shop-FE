import {Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from '../../header-admin/header-admin.component';
import {CommonModule, NgIf} from '@angular/common';
import {TableComponent} from '../../table/table.component';
import {CouponService} from '../../../../services/client/CouponService/coupon-service.service';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, Subject, switchMap} from 'rxjs';

import {UserService} from '../../../../services/user/user.service';
import {UserAdminResponse} from '../../../../dto/user/userAdminResponse.dto';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@Component({
  selector: 'app-list-coupon',
  standalone: true,
  imports: [HeaderAdminComponent, NgIf, TableComponent,CommonModule,
    FormsModule, MatInputModule, ReactiveFormsModule,
    MatAutocompleteModule],
  templateUrl: './list-coupon.component.html',
  styleUrl: './list-coupon.component.scss'
})
export class ListCouponComponent implements OnInit {
  coupons: any = { content: [], totalPages: 0, totalElements: 0 };
  currentPage = 0;
  itemsPerPage = 2;
  sortBy = 'createdAt';
  sortDirection = 'asc';
  searchKeyword = '';
  userSearchCtrl = new FormControl('');
  selectedExpirationDate: string | undefined = undefined;
   formattedExpirationDate: string | undefined = undefined;
  // @ts-ignore
  selectedUser!: UserAdminResponse | null = null;
  searchUserKeyword: string = '';  // Từ khóa tìm kiếm
  allUsers: UserAdminResponse[] = [];  // Danh sách gốc (không bị filter)
  filteredUsers: UserAdminResponse[] = [];  // Danh sách hiển thị sau khi lọc
  isUserDropdownOpen = false;  // Kiểm soát mở/đóng dropdown
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

    this.loadUsers();
  }

// Hàm lọc danh sách theo searchKeyword

  loadCoupons() {
    console.log('🔎 Searching with keyword:', this.searchKeyword);
    const userId = this.selectedUser ? this.selectedUser.id : undefined;
    this.formattedExpirationDate = this.formatDateToISO(this.selectedExpirationDate);
    const pageIndex = this.currentPage  // Chuyển từ Angular index (1-based) sang API index (0-based)
    this.couponService
      .searchCoupons(
        this.searchKeyword,
        pageIndex,
        this.itemsPerPage,
        this.sortBy,
        this.sortDirection,
        userId,
        this.formattedExpirationDate
      )
      .subscribe(
        response => {

          this.coupons = response?.data || { content: [], totalPages: 0, totalElements: 0 };
      console.log(this.coupons);
          // Nếu API trả về page khác pageIndex, cập nhật lại currentPage
          if (response?.data?.number !== pageIndex) {
            this.currentPage = response?.data?.number + 1;

          }
        },
        error => {
          console.error('❌ Error fetching coupons:', error);
          this.coupons = { content: [], totalPages: 0, totalElements: 0 };
        }
      );
  }

  onSearch() {
    this.currentPage = 0;
    this.formattedExpirationDate = this.formatDateToISO(this.selectedExpirationDate);
    console.log(this.formattedExpirationDate)// Reset về trang đầu tiên
    this.searchKeywordChanged.next(this.searchKeyword);
    this.loadCoupons()
  }
  onPageChange(newPage: number) {
    if (newPage !== this.currentPage) {

      this.currentPage = newPage;  // Cập nhật currentPage trước khi gọi API
      setTimeout(() => this.loadCoupons(), 0);  // Đảm bảo cập nhật xong mới gọi API
    }
  }




 

  loadUsers() {
    this.userService.searchUsers('').subscribe(users => {
      this.allUsers = users;
      this.filteredUsers = users;  // Ban đầu hiển thị tất cả
    });
  }

  filterUsers() {
    this.filteredUsers = this.allUsers.filter(user =>
      user.email.toLowerCase().includes(this.searchUserKeyword.toLowerCase()) ||
      user.firstName.toLowerCase().includes(this.searchUserKeyword.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.searchUserKeyword.toLowerCase())
    );
  }

  selectUser(user: UserAdminResponse) {
    this.selectedUser = user;
    this.isUserDropdownOpen = false;  // Đóng dropdown sau khi chọn
    console.log('User đã chọn:', user);
    this.loadCoupons();
  }
  clearUserSelection() {
    this.selectedUser = null  // Xóa user đã chọn
    this.loadCoupons(); // Gọi lại API để lấy toàn bộ coupon
  }

  formatDateToISO(dateString: string | undefined): string | undefined {
    return dateString ? `${dateString}T00:00:00` : undefined;
  }

  toggleSortExpirationDate() {
    if (this.sortBy === 'expirationDate') {
      // Đảo ngược hướng sắp xếp nếu đã chọn expirationDate
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Nếu chưa chọn expirationDate, đặt sắp xếp theo nó và mặc định là asc
      this.sortBy = 'expirationDate';
      this.sortDirection = 'asc';
    }

    this.loadCoupons(); // Gọi API với thông tin sắp xếp mới
  }




}
