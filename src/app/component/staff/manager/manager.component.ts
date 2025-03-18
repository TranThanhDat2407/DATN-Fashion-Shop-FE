import {Component, OnInit} from '@angular/core';
import {StaffResponse} from '../../../dto/staff/StaffResponse';
import {StaffService} from '../../../services/staff/staff.service';
import {CommonModule, DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    StoreHeaderComponent,
  ],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.scss'
})
export class ManagerComponent  implements OnInit{
  staffList: StaffResponse[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  pageNo: number = 0;
  pageSize: number = 10;
  filterForm!: FormGroup;
  storeId: number = 0;

  constructor(
    private staffService: StaffService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      storeId: this.storeId,
      id: [''],
      name: [''],
      roleId: [''],
      startDate: [''],
      endDate: ['']
    });

    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId'); // Dùng .get() để lấy giá trị
      if (storeIdParam) {
        this.storeId = Number(storeIdParam);
        if (!isNaN(this.storeId)) {
          this.fetchStaffList();
        } else {
          console.error('Lỗi: storeId không hợp lệ:', storeIdParam);
        }
      } else {
        console.error('Lỗi: Không tìm thấy storeId trong URL');
      }
    });


  }

  fetchStaffList() {
    const filters = this.filterForm.value;
    this.staffService
      .getStaffList(
        this.storeId, filters.id, filters.name, filters.startDate, filters.endDate,filters.roleId,
        'createdAt', 'desc', this.pageNo, this.pageSize
      )
      .subscribe(response => {
        if (response.status === 200) {
          this.staffList = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
      });
  }

  resetFilters() {
    this.filterForm.reset();
    this.fetchStaffList();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageNo = newPage;
      this.fetchStaffList();
    }
  }

  viewDetail(orderId: number): void {
    this.router.navigate([`/staff/${this.storeId}/staff-manager/${orderId}`]);
  }


}
