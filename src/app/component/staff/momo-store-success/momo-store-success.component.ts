import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CartService} from '../../../services/client/CartService/cart.service';
import {firstValueFrom, forkJoin} from 'rxjs';
import {TokenService} from '../../../services/token/token.service';
import {UserService} from '../../../services/user/user.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-momo-store-success',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './momo-store-success.component.html',
  styleUrl: './momo-store-success.component.scss'
})
export class MomoStoreSuccessComponent implements OnInit, AfterViewInit {

  userId: number | null = null;
  staffId: number = 0;
  storeId: number = 0;

  paymentData: any = {};
  isSuccess: boolean | null = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private  cartService: CartService,
    private tokenService: TokenService,
  ) {}




  ngOnInit(): void {

    const savedStaffId = localStorage.getItem('staffId');
    if (savedStaffId) {
      this.staffId = +savedStaffId;
      console.log("📦 Đọc staffId từ localStorage:", this.staffId);
    } else {
      // fallback nếu không có localStorage thì dùng token
      this.staffId = this.tokenService.getUserId();
      console.log("📦 Không tìm thấy staffId trong localStorage, fallback:", this.staffId);
    }

    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId');
      if (storeIdParam) {
        this.storeId = +storeIdParam;
      }
    });

    this.route.queryParams.subscribe(params => {
      console.log("📥 [MoMo STORE] Redirect với params:", params);
      this.paymentData = params;

      const resultCode = params['resultCode'];
      this.isSuccess = resultCode === '0';

      if (this.isSuccess) {
       this.clearCart();
        localStorage.removeItem('staffId');
      }
    });
  }

  ngAfterViewInit(): void {}

  // verifyStoreMoMo(params: any) {
  //   console.log("📤 [MoMo STORE] Xác thực giao dịch tại cửa hàng:", params);
  //
  //   this.isLoading = true;
  //
  //   this.http.post(`http://localhost:8080/api/v1/momo/store/callback`, params, {
  //     responseType: 'arraybuffer',
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //   }).subscribe({
  //     next: (res: any) => {
  //       console.log("✅ [MoMo STORE] Giao dịch thành công:", res);
  //       this.isLoading = false;
  //       this.isSuccess = true;
  //
  //       this.clearCart(); // Nếu thành công, xóa cart nhân viên
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error("❌ [MoMo STORE] Lỗi xác thực:", err);
  //       this.isLoading = false;
  //       this.isSuccess = false;
  //     }
  //   });
  // }

  clearCart(): void {
    this.cartService.clearCart(this.staffId, "").subscribe({
      next: () => {
        console.log("🛒 Đã xóa giỏ hàng nhân viên sau giao dịch MoMo thành công.");
      },
      error: (err) => {
        console.error("⚠️ Lỗi khi xóa giỏ hàng:", err);
      }
    });
  }
}
