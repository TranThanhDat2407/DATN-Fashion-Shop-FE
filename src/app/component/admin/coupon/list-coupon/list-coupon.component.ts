import {Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from '../../header-admin/header-admin.component';
import {NgIf} from '@angular/common';
import {TableComponent} from '../../table/table.component';
import {CouponService} from '../../../../services/client/CouponService/coupon-service.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-list-coupon',
  standalone: true,
  imports: [HeaderAdminComponent, NgIf, TableComponent, FormsModule],
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

  // Biến tìm kiếm
  searchCode: string = '';
  searchExpirationDate: string = '';
  searchDiscountValue: number | null = null;
  searchMinOrderValue: number | null = null;
  searchLanguageCode: string = '';

  constructor(private couponService: CouponService) {}

  ngOnInit(): void {
    this.loadCoupons();



  }
  loadCoupons() {
    const keyword = this.searchKeyword?.trim() || null;

    this.couponService
      .searchCoupons(keyword, this.currentPage - 1, this.itemsPerPage, this.sortBy, this.sortDirection)
      .subscribe(response => {
        console.log('✅ API Response:', response);
        if (response && response.data) {
          this.coupons = response.data;
        } else {
          console.warn('⚠️ API Response does not contain expected data format.');
          this.coupons = { content: [], totalPages: 0, totalElements: 0 };
        }
      }, error => {
        console.error('❌ Error fetching coupons:', error);
      });
  }





  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCoupons();
  }

  onSearch() {
    this.currentPage = 1; // Reset về trang đầu khi tìm kiếm
    this.loadCoupons();
  }
  // deleteCoupon(coupon: any) {
  //   if (confirm(`Bạn có chắc chắn muốn xóa coupon: ${coupon.code}?`)) {
  //     this.couponService.deleteCoupon(coupon.id).subscribe(() => {
  //       this.loadCoupons(); // Tải lại danh sách sau khi xóa
  //     });
  //   }
  // }
  //
  // toggleCheckbox(coupon: any) {
  //   coupon.active = !coupon.active;
  //   this.couponService.updateCouponStatus(coupon.id, coupon.active).subscribe();
  // }

  // changeActive(coupon: any) {
  //   this.toggleCheckbox(coupon);
  // }

}
