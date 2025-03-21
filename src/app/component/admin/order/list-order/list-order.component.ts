import {Component, OnInit} from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {TableComponent} from "../../table/table.component";
import {PageResponse} from '../../../../dto/Response/page-response';
import {OrderServiceAdmin} from '../../../../services/admin/OrderService/order-serviceAdmin.service';
import {OrderAdmin} from '../../../../models/OrderAdmin/OrderAdmin';
import {catchError, firstValueFrom, forkJoin, map, Observable, of} from 'rxjs';

import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-list-order',
  standalone: true,
    imports: [HeaderAdminComponent, CommonModule, FormsModule, TableComponent],
  templateUrl: './list-order.component.html',
  styleUrls: ['./list-order.component.scss']

})
export class ListOrderComponent implements OnInit {
  dataOrders: PageResponse<OrderAdmin[]> | null = null;
  header: string[] = ['orderId', 'orderTime', 'customerName', 'customerPhone', 'orderStatus', 'paymentStatus', 'totalAmount', 'button-order'];

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


  constructor(private orderService: OrderServiceAdmin, private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchOrdersList();
    this.fetchCities();
  }

  async fetchOrdersList(): Promise<void> {
    const callApis = {
      dataOrder: this.getFilteredOrders().pipe(catchError(() => of(null)))
    };

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataOrders = response.dataOrder;
    console.log("dataOrder: ", this.dataOrders);
  }

  getFilteredOrders() {
    const formatDate = (date?: string) => date ? new Date(date).toISOString().split('T')[0] : undefined;

    return this.orderService.getFilteredOrders(
      this.orderId,
      this.status,
      this.shippingAddress,
      this.minPrice,
      this.maxPrice,
      formatDate(this.fromDate),
      formatDate(this.toDate),
      formatDate(this.updateFromDate),
      formatDate(this.updateToDate),
      this.page,
      this.size,
      this.sortBy,
      this.sortDirection
    ).pipe(
      map((response) => response.data),
      catchError(() => of(null))
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


  // Hiển thị/tắt bộ lọc
  toggleFilter(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }

  // Áp dụng bộ lọc
  applyFilter(): void {
    switch (this.selectedFilter) {
      case 'status':
        this.status = this.selectedCondition;
        break;
      case 'date':
        if (this.selectedDate) {
          if (!this.fromDate) {
            this.fromDate = this.selectedDate;
          } else if (!this.toDate) {
            this.toDate = this.selectedDate;
          }
        }

        break;
      case 'address':
        this.shippingAddress = this.searchKeyword;
        break;
      case 'price':
        if (this.minPrice && this.maxPrice && this.minPrice > this.maxPrice) {
          alert('Khoảng giá không hợp lệ!');
          return;
        }
        break;
    }

    this.getFilteredOrders().subscribe((data) => {
      this.dataOrders = data;
    });
  }




  // Reset bộ lọc
  resetFilter(): void {
    this.selectedFilter = '';
    this.selectedCondition = '';
    this.fromDate = undefined;
    this.toDate = undefined;
    this.selectedDate = '';
    this.shippingAddress = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.fetchOrdersList();
  }


  // Tìm kiếm đơn hàng
  searchOrders(): void {
    this.orderId = this.searchText ? parseInt(this.searchText, 10) : undefined;
    this.fetchOrdersList();
  }

  // Sắp xếp đơn hàng
  sortOrders(): void {
    this.sortDirection = this.sortOrder;
    this.fetchOrdersList();
  }

  // Gọi API lấy danh sách tỉnh/thành phố
  fetchCities(): void {
    this.http.get<any[]>('https://provinces.open-api.vn/api/?depth=1').subscribe(response => {
      this.cities = response.map(city => city.name);
      this.filteredCitiesList = [...this.cities]; // Sao chép danh sách để lọc
    });
  }

  // Lọc danh sách tỉnh/thành phố theo từ khóa tìm kiếm
  filteredCities(): string[] {
    return this.searchKeyword
      ? this.cities.filter(city => city.toLowerCase().includes(this.searchKeyword.toLowerCase()))
      : this.cities;
  }

  // Chọn tỉnh/thành phố
  toggleCitySelection(city: string): void {
    this.shippingAddress = city;
  }

}
