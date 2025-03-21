import {Component, OnInit} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CouponService} from '../../../../services/client/CouponService/coupon-service.service';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {HeaderAdminComponent} from '../../header-admin/header-admin.component';
import {HolidayServiceService} from '../../../../services/admin/HolidayService/holiday-service.service';
import {HolidayDTO} from '../../../../dto/HolidayDTO';
import {DatePipe} from '@angular/common';


@Component({
  selector: 'app-edit-coupon',
  standalone: true,
  imports: [
    MatTable,
    MatIcon,
    ReactiveFormsModule,
    HeaderAdminComponent,
    DatePipe,
    FormsModule
  ],
  templateUrl: './edit-coupon.component.html',
  styleUrl: './edit-coupon.component.scss'
})
export class EditCouponComponent implements OnInit{

  couponData = {
    type: '',
    discountType: '',
    discountValue: 0,
    minOrderValue: 0,
    expirationDays: 0
  };
  selectedFile: File | undefined = undefined;
  isLoading = false;
  public holidays: HolidayDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private holidayService: HolidayServiceService,
    private couponService: CouponService// Inject HolidayService
  ) {}

  ngOnInit() {
    // Gọi API lấy danh sách ngày lễ
    this.loadHolidays()
    this.isLoading = true;
    this.couponService.createCoupon(this.couponData.type, this.couponData, this.selectedFile)
      .subscribe({
        next: (response) => {
          console.log('🎉 Thành công:', response);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('⚠️ Lỗi:', error);
          this.isLoading = false;
        }
      });
  }
  loadHolidays() {
    this.holidayService.getHolidays().subscribe({
      next: (data) => {
        console.log('📌 Dữ liệu nhận từ API:', data);
        this.holidays = data;
        console.log('✅ holidays sau khi gán:', this.holidays);
      },
      error: (err) => {
        console.error('⚠️ Lỗi khi tải dữ liệu:', err);
      }
    });
  }


  // Xử lý submit form
  onSubmit() {

  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
}
