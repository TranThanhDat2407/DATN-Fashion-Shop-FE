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
import {StoreService} from '../../../services/client/store/store.service';


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

  constructor(private orderService: OrderService,
              private storeService: StoreService,
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

          this.route.queryParams.subscribe(queryParams => {
            if (queryParams['startDate'] && queryParams['endDate']) {
              this.filterForm.patchValue({
                startDate: queryParams['startDate'].split('T')[0],
                endDate: queryParams['endDate'].split('T')[0]
              });
            }
          this.fetchStoreOrders();
          });

        } else {
          console.error('Lỗi: storeId không hợp lệ:', storeIdParam);
        }
      } else {
        console.error('Lỗi: Không tìm thấy storeId trong URL');
      }
    });

  }

  pageSize: number = 10; // Default page size
  pageNo: number = 0;
  totalPages: number = 0;
  maxDisplayedPages: number = 10; // Số trang tối đa hiển thị
  additionalPages: number = 10; // Số trang thêm vào khi đạt đến giới hạn

// Hàm thay đổi page size
  onPageSizeChange(): void {
    this.pageNo = 0; // Reset về trang đầu tiên khi thay đổi page size
    this.fetchStoreOrders();
  }

// Hàm thay đổi trang
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageNo = page;
      this.fetchStoreOrders();
    }
  }

// Các hàm hỗ trợ hiển thị phân trang
  getDisplayedPages(): number[] {
    let startPage: number;
    let endPage: number;

    if (this.totalPages <= this.maxDisplayedPages) {
      // Hiển thị tất cả nếu tổng số trang ít
      startPage = 0;
      endPage = this.totalPages - 1;
    } else {
      // Tính toán các trang cần hiển thị
      if (this.pageNo <= this.maxDisplayedPages - 1) {
        startPage = 0;
        endPage = this.maxDisplayedPages - 1;
      } else {
        startPage = this.pageNo;
        endPage = Math.min(this.pageNo + this.additionalPages - 1, this.totalPages - 1);
      }
    }

    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }

  showFirstPage(): boolean {
    return this.getDisplayedPages()[0] > 0;
  }

  showLastPage(): boolean {
    return this.getDisplayedPages()[this.getDisplayedPages().length - 1] < this.totalPages - 1;
  }

  showFirstEllipsis(): boolean {
    return this.getDisplayedPages()[0] > 1;
  }

  showLastEllipsis(): boolean {
    return this.getDisplayedPages()[this.getDisplayedPages().length - 1] < this.totalPages - 2;
  }

// Cập nhật hàm fetchStoreOrders để sử dụng pageSize
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
        this.pageNo,
        this.pageSize // Thêm pageSize vào API call
      )
      .subscribe(
        (response) => {
          if (response && response.data) {
            this.storeOrders = response.data.content.flat();
            this.totalPages = response.data.totalPages;
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

  exportToExcel(): void {
    const filters = this.filterForm.value;
    let startDate = this.filterForm.value.startDate ?
      `${this.filterForm.value.startDate}T00:00:00` : undefined;
    let endDate = this.filterForm.value.endDate ?
      `${this.filterForm.value.endDate}T23:59:59` : undefined;

    // Gọi API xuất Excel với các tham số lọc
    this.storeService.exportStoreOrdersToExcel(
      this.storeId,
      filters.orderStatusId,
      filters.paymentMethodId,
      filters.shippingMethodId,
      filters.customerId,
      filters.staffId,
      startDate,
      endDate,
      'vi' // Ngôn ngữ mặc định
    ).subscribe(
      (blob: Blob) => {
        // Tạo link tải file
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'store_orders.xlsx'; // Tên file tải về
        link.click();
      },
      (error) => {
        console.error('Lỗi khi xuất Excel:', error);
        alert('Lỗi khi xuất Excel. Vui lòng thử lại sau.');
      }
    );
  }

  protected readonly BarcodeFormat = BarcodeFormat;
}
