import {Component, OnInit} from '@angular/core';
import {StoreOrderResponse} from '../../../dto/store/StoreOrderResponse';
import {OrderService} from '../../../services/order/order.service';
import {CommonModule, DatePipe, NgForOf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {InventoryTransferResponse} from '../../../dto/inventory-transfer/InventoryTransferResponse';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {BarcodeFormat} from '@zxing/browser';


@Component({
  selector: 'app-store-order',
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    ReactiveFormsModule,
    StoreHeaderComponent,
    CommonModule,
    FormsModule,
    ZXingScannerModule,
  ],
  templateUrl: './store-order.component.html',
  styleUrl: './store-order.component.scss'
})
export class StoreOrderComponent implements OnInit {
  storeOrders: StoreOrderResponse[] = [];
  storeId: number = 0;
  filterForm!: FormGroup;
  pageNo: number = 0;
  totalPages: number = 1;


  constructor(private orderService: OrderService,
              private route: ActivatedRoute,
              private router: Router,
              private http: HttpClient,
              private fb: FormBuilder
              ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      orderStatusId: [''],
      paymentMethodId: [''],
      shippingMethodId: [''],
      customerId: [''],
      staffId: [''],
      startDate: [''],
      endDate: ['']
    });

    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId'); // Dùng .get() để lấy giá trị
      if (storeIdParam) {
        this.storeId = Number(storeIdParam);
        if (!isNaN(this.storeId)) {
          this.fetchStoreOrders();
        } else {
          console.error('Lỗi: storeId không hợp lệ:', storeIdParam);
        }
      } else {
        console.error('Lỗi: Không tìm thấy storeId trong URL');
      }
    });

  }

  fetchStoreOrders(): void {
    const filters = this.filterForm.value;
    let startDate = this.filterForm.value.startDate ?
      `${this.filterForm.value.startDate}T00:00:00` : undefined;
    let endDate = this.filterForm.value.endDate ?
      `${this.filterForm.value.endDate}T23:59:59` : undefined;

    this.orderService
      .getStoreOrders(
        this.storeId,
        filters.orderStatusId,
        filters.paymentMethodId,
        filters.shippingMethodId,
        filters.customerId,
        filters.staffId,
        startDate,
        endDate,
        this.pageNo
      )
      .subscribe(
        (response) => {
          console.log('API Response:', response); // Kiểm tra dữ liệu trả về
          if (response && response.data) {
            this.storeOrders = response.data.content.flat(); // Lấy danh sách đơn hàng
            this.totalPages = response.data.totalPages; // Cập nhật tổng số trang
          } else {
            this.storeOrders = [];
          }
        },
        (error) => console.error('Lỗi khi tải danh sách đơn hàng:', error)
      );
  }


  viewDetail(orderId: number): void {
      this.router.navigate([`/staff/${this.storeId}/store-order/${orderId}`]);
  }

  getTotalQuantity(order: StoreOrderResponse): number {
    return order.orderDetails?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageNo = page;
      this.fetchStoreOrders();
    }
  }

  applyFilters(): void {
    this.pageNo = 0; // Reset về trang đầu tiên
    this.fetchStoreOrders();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  qrResult: string | null = null;
  isScannerEnabled = false; // Ban đầu tắt máy quét
  allowedFormats = [BarcodeFormat.QR_CODE];
  qrErrorMessage: string | null = null;
  toggleScanner(): void {
    this.qrErrorMessage = null;
    this.isScannerEnabled = !this.isScannerEnabled;
  }

  onQrCodeScanned(result: string) {
    console.log('QR Code Scanned:', result);
    this.qrResult = result;

    if (result) {
      const orderId = Number(result);
      this.viewDetail(orderId);
    } else {
      this.qrErrorMessage = '❌ Mã QR không hợp lệ. Vui lòng thử lại!';
      console.error('Lỗi: Không tìm thấy orderId trong mã QR');
    }
  }

  protected readonly BarcodeFormat = BarcodeFormat;
}
