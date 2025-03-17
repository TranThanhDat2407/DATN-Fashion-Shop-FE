import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StaffService} from '../../../../services/staff/staff.service';
import {StaffResponse} from '../../../../dto/staff/StaffResponse';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {CommonModule} from '@angular/common';
import {StoreHeaderComponent} from '../../store-header/store-header.component';

@Component({
  selector: 'app-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    StoreHeaderComponent,
  ],
  templateUrl: './staff-detail.component.html',
  styleUrl: './staff-detail.component.scss'
})
export class StaffDetailComponent implements OnInit{
  staff: StaffResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId'); // Fix lỗi ID
    if (userId) {
      this.getStaffDetails(Number(userId));

    }
  }

  getStaffDetails(userId: number): void {
    this.staffService.getStaffByUserId(userId).subscribe({
      next: (response: ApiResponse<StaffResponse>) => {
        this.staff = response.data;
        console.log(this.staff);
      },
      error: (err) => {
        console.error('Lỗi lấy thông tin nhân viên:', err);
      }
    });
  }

  loading: boolean = false;
  toggleStatus(): void {
    if (!this.staff) return;

    this.loading = true;
    const newStatus = !this.staff.isActive;

    this.staffService.updateStaffStatus(this.staff.id, newStatus).subscribe({
      next: () => {
        this.staff!.isActive = newStatus;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi cập nhật trạng thái:', err);
        this.loading = false;
      }
    });
  }
}
