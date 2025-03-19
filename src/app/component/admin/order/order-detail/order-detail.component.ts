import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {CurrencyPipe, DatePipe, JsonPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {OrderDetailAdminResponse} from '../../../../models/OrderDetail/OrderDetailAdminResponse';
import {ActivatedRoute} from '@angular/router';
import {OrderDetailService} from '../../../../services/client/OrderDetailService/order-detail.service';
import {NavigationService} from '../../../../services/Navigation/navigation.service';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import {Chart} from 'chart.js/auto';
import {FormsModule} from '@angular/forms';
import {OrderServiceAdmin} from '../../../../services/admin/OrderService/order-serviceAdmin.service';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    CurrencyPipe,
    NgIf,
    JsonPipe,
    NgForOf,
    FormsModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit, OnChanges, AfterViewInit {
  orderId!: number;
  orderStatuses: string[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DONE'];
  orderDetailsAdmin: OrderDetailAdminResponse[] = [];
  orderDetails: OrderDetailAdminResponse | null = null;


  chart!: Chart | undefined; // Biến lưu trữ biểu đồ

  constructor(
    private route: ActivatedRoute,
    private orderDetailService: OrderDetailService,
    private orderServiceAdmin: OrderServiceAdmin,
    private navigationService: NavigationService,
    private toastService: ToastrService,
  ) {
  }

  async ngOnInit(): Promise<void> {

    this.route.paramMap.subscribe(params => {
      this.orderId = Number(params.get('orderId'));
      console.log("Order ID:", this.orderId);
      if (this.orderId) {
        this.fetchOrderDetailsAdmin();
      }
    });
  }

  fetchOrderDetailsAdmin(): void {
    this.orderDetailService.getOrderDetailsAdmin(this.orderId).subscribe(
      response => {
        console.log("API Response:", response);

        if (response.status === 200 && response.data?.length > 0) {
          this.orderDetailsAdmin = response.data;
          this.orderDetails = this.orderDetailsAdmin[0];
          // Gán giá trị đơn hàng từ dữ liệu nhận được
        } else {
          console.warn("Không có dữ liệu đơn hàng.");
          this.orderDetailsAdmin = [];
          this.orderDetails = null;
        }
      },
      error => {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        this.orderDetailsAdmin = [];
        this.orderDetails = null;

      }
    );
  }

  updateOrderStatus(newStatus: string | undefined): void {
    if (!newStatus) {
      console.error('Trạng thái mới không hợp lệ!');
      return;
    }

    if (!this.orderId) {
      console.error('Không tìm thấy orderId!');
      return;
    }

    this.orderServiceAdmin.updateOrderStatus(this.orderId, newStatus).subscribe(
      (response) => {
        if (response.status === 200) {
          console.log('Cập nhật trạng thái đơn hàng thành công:', response);
          alert('Cập nhật trạng thái thành công!');

          // Cập nhật lại chi tiết đơn hàng sau khi cập nhật trạng thái
          this.fetchOrderDetailsAdmin();
        } else {
          console.error('Lỗi cập nhật trạng thái:', response);
          alert('Lỗi cập nhật trạng thái!');
        }
      },
      (error) => {
        console.error('Lỗi khi gửi yêu cầu cập nhật trạng thái:', error);
        alert('Đã xảy ra lỗi, vui lòng thử lại!');
      }
    );
  }

  getFilteredOrderStatuses(): string[] {
    if (this.orderDetails?.paymentStatus === 'UNPAID') {
      return this.orderStatuses.filter(status => status !== 'DONE');
    }
    return this.orderStatuses; // Nếu đã thanh toán, hiển thị tất cả trạng thái
  }

  isCompleted(status: string): boolean {
    const orderStages = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'DONE'];
    const currentIndex = orderStages.indexOf(<string>this.orderDetails?.orderStatus);
    const statusIndex = orderStages.indexOf(status);
    return statusIndex <= currentIndex;
  }


  getImageProduct(imageUrl: string | null): string {
    return imageUrl ? `http://localhost:8080/uploads/images/products/${imageUrl}` : 'assets/images/default-product.png';
  }



  ngAfterViewInit() {
    if (this.orderDetails) {
      this.renderChart();
    }
  }

  getTotalQuantity(): number {
    return this.orderDetailsAdmin?.reduce((total, detail) => total + (detail.quantity || 0), 0) || 0;
  }

  getTotalOrderValue(): string {
    const totalValue = this.orderDetailsAdmin?.reduce((sum, detail) => sum + (detail.totalPrice || 0), 0) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalValue);
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderDetails'] && this.orderDetails) {
      this.renderChart();
    }
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.orderDetails) {
      console.warn('Không có dữ liệu đơn hàng để hiển thị biểu đồ.');
      return;
    }

    this.chart = new Chart('orderChart', {
      type: 'bar',
      data: {
        labels: ['Total Amount', 'Shipping Fee', 'Tax', 'Coupon'],
        datasets: [{
          label: 'Order Breakdown',
          data: [
            this.orderDetails.totalAmount || 0,
            this.orderDetails.shippingFee || 0,
            this.orderDetails.tax || 0,
            this.orderDetails.couponPrice || 0
          ],
          backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#2196F3']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  protected readonly Object = Object;
}
