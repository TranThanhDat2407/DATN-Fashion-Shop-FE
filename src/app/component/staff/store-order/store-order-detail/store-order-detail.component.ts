import {Component, OnInit} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import {StoreHeaderComponent} from '../../store-header/store-header.component';
import {OrderService} from '../../../../services/order/order.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormsModule} from '@angular/forms';
import {StoreOrderResponse} from '../../../../dto/store/StoreOrderResponse';

@Component({
  selector: 'app-store-order-detail',
  standalone: true,
  imports: [
    NgClass,
    StoreHeaderComponent,
    CurrencyPipe,
    DatePipe,
    CommonModule,
    FormsModule
  ],
  templateUrl: './store-order-detail.component.html',
  styleUrl: './store-order-detail.component.scss'
})
export class StoreOrderDetailComponent implements OnInit{
  orderId!: number;
  order!: StoreOrderResponse;

  constructor(private orderService: OrderService,
              private route: ActivatedRoute,
              private router: Router,
              private http: HttpClient,
              private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.orderId = +id;
        this.fetchOrderDetail();
      }
    });
  }

  fetchOrderDetail(): void {
    this.orderService.getStoreOrderDetail(this.orderId).subscribe(
      (response) => {
        this.order = response.data;
      },
      (error) => console.error('Error fetching order detail:', error)
    );
  }

  getSubtotal(): number {
    if (!this.order?.orderDetails) return 0;
    return this.order.orderDetails.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  getDiscountValue(): number {
    if (!this.order?.coupon) {
      return 0; // Không có coupon thì không giảm giá
    }

    const { discountType, discountValue } = this.order.coupon;
    if (discountType === 'PERCENTAGE') {
      return (this.getSubtotal() * discountValue) / 100;
    } else if (discountType === 'FIXED') {
      return discountValue;
    }
    return 0;
  }

  updateOrderStatus(statusName: string): void {
    this.orderService.updateStoreOrderStatus(this.orderId, statusName).subscribe({
      next: () => {
        console.log('Cập nhật trạng thái thành công');
        this.fetchOrderDetail();
      },
      error: (err) => console.error('Lỗi cập nhật trạng thái:', err)
    });
  }

  updatePaymentMethod(paymentMethodName: string): void {
    this.orderService.updateStorePaymentMethod(this.orderId, paymentMethodName).subscribe({
      next: () => {
        console.log('Cập nhật phương thức thanh toán thành công');
        this.fetchOrderDetail();
      },
      error: (err) => console.error('Lỗi cập nhật phương thức thanh toán:', err)
    });
  }
}
