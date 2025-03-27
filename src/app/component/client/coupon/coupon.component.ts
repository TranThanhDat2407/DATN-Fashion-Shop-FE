import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';

import {TokenService} from '../../../services/token/token.service';
import {CouponLocalizedDTO} from '../../../dto/coupon/CouponClientDTO';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {AddressDTO} from '../../../dto/address/AddressDTO';
import {CouponService} from '../../../services/client/CouponService/coupon-service.service';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {CartDTO} from '../../../dto/CartDTO';
import {CartService} from '../../../services/client/CartService/cart.service';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    FormsModule,
    RouterLink,
    DecimalPipe
  ],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.scss'
})
export class CouponComponent implements OnInit {
  couponCode: string = '';
  selectedCoupon: CouponLocalizedDTO | null = null;
  userId: number | null = null; // userId ban đầu là null
  coupons : CouponLocalizedDTO[] | null = null;
  message : string = '';

  cartData: CartDTO | null = null;
  sessionId?: string;

  constructor(private router: Router,
              private navigationService: NavigationService,
              private couponService: CouponService,
              private tokenService: TokenService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private cookieService: CookieService,

  ) {

  }
  ngOnInit() {
    this.sessionId = this.cookieService.get('SESSION_ID') || '';
    console.log(this.sessionId);
    this.userId = this.tokenService.getUserId()
    console.log(this.userId)// Gọi API khi component được khởi tạo4
    this.loadCoupons()
    this.cartService.getAllCart(this.userId,this.sessionId ).subscribe({
      next: (response) => {
        this.cartData = response.data;
        console.log('Giỏ hàng:', this.cartData);
      },
      error: (error) => {
        console.error('Lỗi khi lấy giỏ hàng:', error);
      }
    });


  }
  loadCoupons() {
    if (this.userId !== null) {
      this.couponService.getCouponsForUser(this.userId, 'vi').subscribe(
        (response: ApiResponse<CouponLocalizedDTO[]>) => {
          this.coupons = response.data
            .map(coupon => ({
              ...coupon,
              expirationDate: Array.isArray(coupon.expirationDate)
                ? new Date(
                  coupon.expirationDate[0], // Năm
                  coupon.expirationDate[1] - 1, // Tháng (bắt đầu từ 0)
                  coupon.expirationDate[2], // Ngày
                  coupon.expirationDate[3] || 0, // Giờ
                  coupon.expirationDate[4] || 0, // Phút
                  coupon.expirationDate[5] || 0 // Giây
                )
                : new Date(coupon.expirationDate) // Nếu đã là Date hoặc string thì giữ nguyên
            }));

          // ✅ Kiểm tra danh sách đã lọc thành công
        },
        (error: any) => {
          console.error('Lỗi khi tải mã giảm giá:', error);
        }
      );
    } else {
      console.error('Không tìm thấy userId trong localStorage');
    }
  }
  applyCoupon() {
    if (!this.couponCode.trim() || !this.selectedCoupon) {
      this.message = '⚠️ Vui lòng chọn hoặc nhập mã giảm giá!';
      return;
    }
    // @ts-ignore
    if (this.orderTotal < this.selectedCoupon.minOrderValue) {
      // @ts-ignore
      this.message = `⚠️ Đơn hàng phải tối thiểu ${this.selectedCoupon.minOrderValue.toLocaleString()} VND để áp dụng mã giảm giá!`;
      return;
    }

    // ✅ Chuẩn bị dữ liệu DTO đầy đủ để gửi sang trang checkout
    const checkoutData = {
      coupon: this.coupons, // Gửi DTO đầy đủ
      orderTotal: this.cartData?.totalPrice, // Tổng tiền hàng
      userId: this.userId // ID người dùng
    };
    // ✅ Chuyển sang trang thanh toán, truyền toàn bộ DTO qua state
    this.message = '🎉 Mã giảm giá hợp lệ! Đang áp dụng...';
    setTimeout(() => {
      this.router.navigate(['../cart'], { relativeTo: this.activatedRoute });
    }, 500);
  }

  selectCoupon(id: number) {
    // Tìm mã giảm giá theo ID từ danh sách
    const selected = this.coupons?.find(coupon => coupon.id === id) || null;

    if (selected) {
      // @ts-ignore
      this.selectedCoupon = selected; // Gán mã giảm giá đã chọn
      this.couponCode = selected.code; // Cập nhật mã giảm giá hiển thị trên UI
      console.log('✅ Selected Coupon:', this.selectedCoupon);
      this.couponService.setCouponDTO(selected);
    } else {
      this.selectedCoupon = null;
      console.warn('⚠️ Không tìm thấy mã giảm giá!');
    }
  }




}
