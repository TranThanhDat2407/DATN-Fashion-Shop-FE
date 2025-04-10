import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  CountStartAndWishList,
  InventoryStatistics,
  RevenueService
} from '../../../services/admin/RevenueService/revenue.service';
import { debounceTime } from 'rxjs/operators';
import {CurrencyPipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, RouterLink, RouterOutlet} from '@angular/router';
import {HeaderAdminComponent} from "../header-admin/header-admin.component";

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  standalone: true,
    imports: [
        CurrencyPipe,
        ReactiveFormsModule,
        NgIf,
        NgForOf,
        RouterLink,
        RouterOutlet,
        DecimalPipe,
        FormsModule,
        HeaderAdminComponent
    ],
  styleUrls: ['./statistical.component.scss']
})
export class StatisticalComponent implements OnInit {
  dailyRevenue: number = 0;
  monthlyRevenue: number = 0;
  yearlyRevenue: number = 0;

  orders: any[] = [];

  selectedDate = new Date().toISOString().split('T')[0];
  selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  selectedYear = new Date().getFullYear();


  languageCode = 'vi';
  page = 0;
  size = 10;

  products: CountStartAndWishList[] = [];
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  productId?: number;


  searchForm = new FormGroup({
    searchText: new FormControl('')
  });

  constructor(private revenueService: RevenueService) {
  }

  ngOnInit(): void {
    this.loadProductStats(0);

    this.fetchDailyRevenue();
    this.fetchMonthlyRevenue();
    this.fetchYearlyRevenue();

    // Lắng nghe thay đổi trong ô tìm kiếm, áp dụng debounce để tránh gọi API liên tục
    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.applyFilter();
    });
  }

  loadProductStats(page: number) {
    const { searchText } = this.searchForm.value;
    const productName = searchText ? searchText.trim() : undefined;

    this.revenueService.getProductStats('vi', this.productId, productName, page, this.pageSize)
      .subscribe(response => {
        this.products = response.data?.content || [];
        this.totalPages = response.data?.totalPages || 0;
        this.currentPage = page;
      }, error => console.error('❌ Lỗi khi tải danh sách sản phẩm:', error));
  }


  fetchDailyRevenue() {
    this.revenueService.getDailyRevenue(this.selectedDate).subscribe({
      next: (response: number) => {
        this.dailyRevenue = response || 0;
      },
      error: (err) => console.error('Lỗi khi lấy doanh thu ngày:', err),
    });
  }

  fetchMonthlyRevenue() {
    const [year, month] = this.selectedMonth.split('-').map(Number);
    this.revenueService.getMonthlyRevenue(year, month).subscribe({
      next: (response: number) => {
        this.monthlyRevenue = response || 0;
      },
      error: (err) => console.error('Lỗi khi lấy doanh thu tháng:', err),
    });
  }

  fetchYearlyRevenue() {
    this.revenueService.getYearlyRevenue(this.selectedYear).subscribe({
      next: (response: number) => {
        this.yearlyRevenue = response || 0;
      },
      error: (err) => console.error('Lỗi khi lấy doanh thu năm:', err),
    });
  }






  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadProductStats(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.loadProductStats(this.currentPage - 1);
    }
  }

  applyFilter() {
    this.loadProductStats(0);
  }

  resetFilter() {
    this.searchForm.reset();
    this.loadProductStats(0);
  }

  getImageProduct(imageUrl: string | null): string {
    return imageUrl ? `http://localhost:8080/uploads/images/products/${imageUrl}` : 'assets/images/default-product.png';
  }

}
