import {Component, OnInit} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CouponService} from '../../../../services/client/CouponService/coupon-service.service';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {HeaderAdminComponent} from '../../header-admin/header-admin.component';
import {HolidayServiceService} from '../../../../services/admin/HolidayService/holiday-service.service';
import {HolidayDTO} from '../../../../dto/HolidayDTO';
import {CommonModule, DatePipe, JsonPipe, NgClass} from '@angular/common';
import {CouponConfigDTO} from '../../../../dto/coupon/CouponConfigDTO';
import {TableComponent} from '../../table/table.component';


@Component({
  selector: 'app-edit-coupon',
  standalone: true,
  imports: [
    CommonModule,
    MatTable,
    MatIcon,
    ReactiveFormsModule,
    HeaderAdminComponent,
    DatePipe,
    FormsModule,
    JsonPipe,
    NgClass,
    TableComponent
  ],
  templateUrl: './edit-coupon.component.html',
  styleUrl: './edit-coupon.component.scss'
})
export class EditCouponComponent implements OnInit{

  couponData = {
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderValue: 0,
    expirationDays: 0,
    imageUrl: ""

  };
  minDiscountValue = 1;
  maxDiscountValue = 100;
  selectedHolidaySlug: string = '';
  selectedFile: File | undefined = undefined;
  isLoading = false;
  public holidays: HolidayDTO[] = [];
  selectedHolidayId: number | undefined | null = null;
  couponConfigs: { [key: string]: CouponConfigDTO } = {};


  constructor(
    private fb: FormBuilder,
    private holidayService: HolidayServiceService,
    private couponService: CouponService// Inject HolidayService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.loadHolidays(); // Gọi API lấy danh sách ngày lễ
    this.onDiscountTypeChange(); // Thiết lập giá trị min/max cho giảm giá
    this.isLoading = false;
    this.loadCouponConfigs()



  }
  loadHolidays() {
    this.holidayService.getHolidays().subscribe({
      next: (data) => {
        // console.log('📌 Dữ liệu nhận từ API:', data);
        this.holidays = data;

      },
      error: (err) => {
        console.error('⚠️ Lỗi khi tải danh sách ngày lễ:', err);
      }
    });
  }
  loadCouponConfigs() {
    this.isLoading = true;  // Bắt đầu quá trình tải dữ liệu
    this.couponService.getValidCouponConfigs().subscribe({
      next: (data) => {
        this.couponConfigs = data;  // Cập nhật couponConfigs với dữ liệu nhận được từ backend
        console.log('📌 Danh sách mã giảm giá:', this.couponConfigs);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('⚠️ Lỗi khi tải danh sách mã giảm giá:', err);
        this.isLoading = false;  // Kết thúc quá trình tải dữ liệu khi có lỗi
      }
    });
  }

  onHolidayChange(event: any) {
    console.log("Ngày lễ đã chọn:", this.selectedHolidayId);
    const holiday = this.holidays.find(h => h.id == this.selectedHolidayId);
    if (holiday) {
      this.selectedHolidaySlug = this.convertToSlug(holiday.holidayName);
    } else {
      this.selectedHolidaySlug = ''; // Đặt về rỗng nếu không có ngày lễ
    }
  }


  convertToSlug(text: string): string {
    return text
      .normalize("NFD") // Tách dấu khỏi ký tự gốc
      .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
      .replace(/\s+/g, "") // Xóa khoảng trắng
      .toLowerCase(); // Chuyển thành chữ thường
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  createCoupon() {
    if (this.isLoading) return;
    if (!this.validateForm()) return;
    this.isLoading = true;
    this.couponService.createCoupon(this.selectedHolidaySlug, this.couponData, this.selectedFile)
      .subscribe({
        next: (response) => {
          console.log('🎉 Tạo mã giảm giá thành công:', response);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('⚠️ Lỗi khi tạo mã giảm giá:', error);
          this.isLoading = false;
        }
      });
this.loadCouponConfigs()
  }
  editCoupon(couponKey: string) {
    const selectedConfig = this.couponConfigs[couponKey];
    if (selectedConfig) {
      // Tìm ngày lễ theo slug để lấy lại tên gốc
      this.selectedHolidaySlug = this.revertSlugToHolidayName(couponKey);

      // Tìm ngày lễ có slug tương ứng để cập nhật selectedHolidayId
      const matchingHoliday = this.holidays.find(h => this.convertToSlug(h.holidayName) === couponKey);
      this.selectedHolidayId = matchingHoliday ? matchingHoliday.id : null;

      // Sao chép dữ liệu vào form
      // @ts-ignore
      this.couponData = { ...selectedConfig };
    }
  }


  revertSlugToHolidayName(slug: string): string {
    const holiday = this.holidays.find(h => this.convertToSlug(h.holidayName) === slug);
    return holiday ? holiday.holidayName : slug; // Nếu không tìm thấy, trả về slug ban đầu
  }

  resetCoupon(couponKey: string) {
    if (confirm(`Bạn có chắc chắn muốn đặt lại dữ liệu mã giảm giá: ${couponKey}?`)) {
      this.couponService.resetCoupon(couponKey).subscribe({
        next: () => {
          console.log(`🗑️ Đã xóa mã giảm giá: ${couponKey}`);

          // XÓA LUÔN KHỎI UI
          delete this.couponConfigs[couponKey];


          console.log("📌 Danh sách mã giảm giá sau khi xóa:", this.couponConfigs);

        },
        error: (err: any) => {
          console.error(`⚠️ Lỗi khi đặt lại mã giảm giá: ${couponKey}`, err);
        }
      });
    }
  }







  onDiscountTypeChange() {
    if (this.couponData.discountType === 'PERCENTAGE') {
      this.minDiscountValue = 1;
      this.maxDiscountValue = 100;
    } else {
      this.minDiscountValue = 100000;
      this.maxDiscountValue = 1000000;
    }
  }
  validateForm(): boolean {
    if (!this.couponData.discountValue ||
      this.couponData.discountValue < this.minDiscountValue ||
      this.couponData.discountValue > this.maxDiscountValue) {
      alert(`Giá trị giảm phải từ ${this.minDiscountValue} đến ${this.maxDiscountValue}`);
      return false;
    }
    if (!this.couponData.minOrderValue || this.couponData.minOrderValue < 100) {
      alert('Giá trị đơn hàng tối thiểu phải từ 100 trở lên.');
      return false;
    }
    if (!this.couponData.expirationDays ||
      this.couponData.expirationDays < 3 ||
      this.couponData.expirationDays > 30) {
      alert('Số ngày hết hạn phải từ 3 đến 30 ngày.');
      return false;
    }
    return true;
  }

  protected readonly Object = Object;
}
