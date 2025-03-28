import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { TableComponent } from '../../table/table.component';
import {UserService} from '../../../../services/user/user.service';
import {PageResponse} from '../../../../dto/Response/page-response';
import {UserAdminResponse} from '../../../../dto/user/userAdminResponse.dto';
import {GetUsersParams} from '../../../../dto/user/GetUsersParams';
import {NgIf} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {FormsModule} from '@angular/forms';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string; // Đổi thành chuỗi
  gender?: string;
  isActive?: boolean;
  createdAt?: string; // Đổi thành chuỗi
  updatedAt?: string; // Đổi thành chuỗi
  createdBy?: number;
  updatedBy?: number;
}


@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [HeaderAdminComponent, TableComponent, NgIf, FormsModule],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss'
})
export class ListUserComponent implements OnInit {
  debounceTimerName: any;
  emailSearch?: string
  // Phân trang
  pageIndex: number = 0;
  pageSize: number = 10;

// Filter thông tin user
  filterEmail: string = '';
  filterFirstName: string = '';
  filterLastName: string = '';
  filterPhone: string = '';
  filterGender: string = ''; // ví dụ: 'MALE', 'FEMALE'
  filterActiveStatus: any = null;

// Filter theo ngày tạo
  filterStartDate: string | null = null; // ISO: '2024-01-01T00:00:00'
  filterEndDate: string | null = null;

// Role
  filterRoleId: number | null = null;

// Sắp xếp
  sortBy: string = 'id';
  sortDir: 'asc' | 'desc' = 'desc';

  headerTableList: string[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'gender',
    'isActive',
    'createdAt',
    'updatedAt',
  ]

  userData: PageResponse<UserAdminResponse[]> | null = null

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }





  async ngOnInit(): Promise<void> {
    await this.filterUser();
  }


  async filterUser(): Promise<void> {
    const filterParams: GetUsersParams = {
      page: this.pageIndex,
      size: this.pageSize,
      email: this.filterEmail,
      firstName: this.filterFirstName,
      lastName: this.filterLastName,
      phone: this.filterPhone,
      gender: this.filterGender,
      isActive: this.filterActiveStatus,
      startDate: this.filterStartDate ?? undefined,
      endDate: this.filterEndDate ?? undefined,
      roleId: this.filterRoleId ?? undefined,
      sortBy: this.sortBy,
      sortDir: this.sortDir
    };

    this.userService.getAllUser(filterParams).subscribe({
      next: (response) => {
        console.log(response.data)
        this.userData = response.data;
      },
      error: (err) => {
        console.error('Error loading users', err);
      }
    });
  }


  onPageChange(newPage: number): void {
    this.pageIndex = newPage;
    this.filterUser();
  }

  toggleIsActive = (item: any): void => {
    this.userService.blockOrEnableUser(item.id).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái người dùng thành công');
        this.filterUser(); // Gọi lại danh sách nếu bạn muốn refresh
      },
      error: (err) => {
        this.toastr.error('Có lỗi xảy ra khi cập nhật trạng thái');
        console.error(err);
      }
    });

  }

  onCreateAtChange(){
    this.sortBy = this.sortBy;
    this.filterUser();
  }
  onSortDirChange(){
    this.sortDir = this.sortDir
    this.filterUser()
  }
  onNameChange(value: string){
    // Xóa timer cũ nếu có
    if (this.debounceTimerName) {
      clearTimeout(this.debounceTimerName);
    }
    // Đặt timer mới chờ 1s
    this.debounceTimerName = setTimeout(() => {
      this.searchName(value);
    }, 1000);
  }
  onIsActiveChange(){
    this.filterActiveStatus = this.filterActiveStatus;
    this.filterUser();
  }
  searchName(value: string): void {
    this.filterEmail = value;

    setTimeout(() => {
      this.onPageChange(0)
    }, 500);

    this.cdr.detectChanges(); // Cập nhật lại giao diện ngay lập tức
  }
}
