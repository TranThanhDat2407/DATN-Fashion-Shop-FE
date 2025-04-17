import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule} from '@angular/forms';
import {TableComponent} from "../../table/table.component";
import {PageResponse} from '../../../../dto/Response/page-response';
import {OrderServiceAdmin} from '../../../../services/admin/OrderService/order-serviceAdmin.service';
import {OrderAdmin} from '../../../../models/OrderAdmin/OrderAdmin';


import {HttpClient} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
import {catchError, firstValueFrom, map, of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-list-order',
  standalone: true,
    imports: [HeaderAdminComponent, CommonModule, FormsModule, TableComponent],
  templateUrl: './list-order.component.html',
  styleUrls: ['./list-order.component.scss']

})
export class ListOrderComponent implements OnInit {
  dataOrders: PageResponse<OrderAdmin[]> | null = null;
  header: string[] = ['orderId', 'orderTime', 'customerName', 'customerPhone', 'orderStatus', 'paymentStatus', 'totalPrice', 'button-order'];

  // Các tham số lọc
  orderId?: number;
  status?: string;
  shippingAddress?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string;
  toDate?: string;
  updateFromDate?: string;
  updateToDate?: string;
  page: number = 0;
  size: number = 5;
  sortBy: string = 'id';
  sortDirection: string = 'desc';
  checkedItemOrder: number[] = [];
  storeId?: number;

  // UI Controls
  isFilterVisible = false;
  selectedFilter = '';
  selectedCondition = '';
  selectedDate?: string;
  searchKeyword = '';
  searchText = '';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Danh sách tỉnh/thành phố từ API
  cities: string[] = [];
  filteredCitiesList: string[] = [];


  constructor(
    private orderService: OrderServiceAdmin,
    private http: HttpClient,
    private toastService: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.fetchCities();
    this.fetchOrdersList();
    this.route.queryParams.subscribe(params => {
      if (params['storeId']) {
        this.storeId = +params['storeId'];
      }
      if (params['fromDate']) {
        this.fromDate = params['fromDate'].split('T')[0]; // Lấy phần ngày thôi
      }
      if (params['toDate']) {
        this.toDate = params['toDate'].split('T')[0]; // Lấy phần ngày thôi
      }

      // Nếu có params thì tự động load data
      if (this.storeId || this.fromDate || this.toDate) {
        this.fetchOrdersList();
      }
    });


  }

  async fetchOrdersList(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.getFilteredOrders().pipe(
          catchError((error) => {
            console.error('Lỗi khi gọi API:', error);
            return of(null);
          })
        )
      );

      if (response && response.data) {
        this.dataOrders = response.data;
      } else {
        this.dataOrders = null;
      }

      console.log('📌 Dữ liệu trả về sau khi lọc:', this.dataOrders);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
    }
  }



  private formatDate(date: string | undefined, isStartDate: boolean): string | undefined {
    return date ? `${date}T${isStartDate ? '00:00:00' : '23:59:59'}` : undefined;
  }

  getFilteredOrders() {
    return this.orderService
      .getFilteredOrders(
        this.orderId,
        this.status,
        this.shippingAddress,
        this.minPrice,
        this.maxPrice,
        this.formatDate(this.fromDate, true),
        this.formatDate(this.toDate, false),
        this.formatDate(this.updateFromDate, true),
        this.formatDate(this.updateToDate, false),
        this.page,
        this.size,
        this.sortBy,
        this.sortDirection,
        this.storeId
      )
      .pipe(
        catchError((error) => {
          console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
          return of(null);
        })
      );
  }


  toggleCheckboxOrder(item: any): void {
    item.checked = !item.checked;
    if (item.checked) {
      if (!this.checkedItemOrder.includes(item.id)) {
        this.checkedItemOrder.push(item.id);
      }
    } else {
      this.checkedItemOrder = this.checkedItemOrder.filter(id => id !== item.id);
    }
    console.log('After toggle:', this.checkedItemOrder);
  }

  onPageChangeOrder(newPage: number): void {
    this.page = newPage;
    this.fetchOrdersList();
  }

  toggleFilter(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }



  onItemsPerPageChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.fetchOrdersList(); // Gọi lại API với size mới
  }

  applyFilter(): void {
    // Kiểm tra nếu chưa chọn bộ lọc
    if (!this.selectedFilter) {
      this.toastService.error('Vui lòng chọn điều kiện lọc!', 'Lỗi', { timeOut: 2000 });
      return;
    }

    switch (this.selectedFilter) {
      case 'status':
        this.status = this.selectedCondition;
        break;

      case 'date':
        if (!this.fromDate || !this.toDate) {
          this.toastService.warning('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!', 'Cảnh báo', { timeOut: 2000 });
          return;
        }

        const from = new Date(this.fromDate);
        const to = new Date(this.toDate);

        if (from > to) {
          this.toastService.error('Ngày bắt đầu không thể lớn hơn ngày kết thúc!', 'Lỗi', { timeOut: 2000 });
          return;
        }
        break;

      case 'address':
        if (!this.searchKeyword || this.searchKeyword.trim().length < 3) {
          this.toastService.warning('Vui lòng nhập ít nhất 3 ký tự để tìm kiếm!', 'Cảnh báo', { timeOut: 2000 });
          return;
        }
        this.shippingAddress = this.searchKeyword.trim();
        break;


      case 'price':
        if (!this.minPrice || !this.maxPrice) {
          this.toastService.warning('Vui lòng nhập khoảng giá hợp lệ!', 'Cảnh báo', { timeOut: 2000 });
          return;
        }

        if (this.minPrice > this.maxPrice) {
          this.toastService.error('Khoảng giá không hợp lệ! Giá tối thiểu không thể lớn hơn giá tối đa.', 'Lỗi', { timeOut: 2000 });
          return;
        }
        break;
    }
    console.log('📌 Địa chỉ lọc cuối cùng:', this.shippingAddress);

    // Gọi API lấy danh sách đơn hàng sau khi kiểm tra hợp lệ
    this.fetchOrdersList();
    this.toastService.success('Bộ lọc đã được áp dụng!', 'Thành công', { timeOut: 2000 });
  }



  resetFilter(): void {
    this.selectedFilter = '';
    this.selectedCondition = '';
    this.fromDate = undefined;
    this.toDate = undefined;
    this.shippingAddress = undefined;
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.page = 0;

    this.fetchOrdersList();
  }

  searchOrders(): void {
    this.orderId = this.searchText ? parseInt(this.searchText, 10) : undefined;
    this.fetchOrdersList();
  }

  sortOrders(): void {
    this.sortDirection = this.sortOrder;
    this.fetchOrdersList();
  }

  fetchCities(): void {
    this.http.get<any[]>('https://provinces.open-api.vn/api/?depth=1').subscribe(response => {
      this.cities = response.map(city => city.name);
      this.filteredCitiesList = [...this.cities];
    });
  }

  filteredCities(): string[] {
    return this.searchKeyword
      ? this.cities.filter(city => city.toLowerCase().includes(this.searchKeyword.toLowerCase()))
      : this.cities;
  }

  toggleCitySelection(city: string): void {
    this.shippingAddress = city;
  }

}
