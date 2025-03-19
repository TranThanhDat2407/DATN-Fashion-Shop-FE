import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { ChartComponent } from "ng-apexcharts";
import {CurrencyPipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import {RevenueService} from '../../../services/admin/RevenueService/revenue.service';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {PageResponse} from '../../../dto/Response/page-response';
import { NgxPaginationModule } from 'ngx-pagination';


interface TopProduct {
  productVariantId: number;
  productName: string;
  color: string;
  colorImage: string;
  size: string;
  imageUrl: string;
  totalSold: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  styleUrls: ['./statistical.component.scss'],
  imports: [
    CurrencyPipe,
    NgStyle,
    ChartComponent,
    FormsModule,
    NgIf,
    NgForOf,
    NgxPaginationModule
  ],
  standalone: true
})
export class StatisticalComponent implements OnInit {
  currentPage: number = 1;
  dailyRevenue!: number;
  monthlyRevenue!: number;
  yearlyRevenue!: number;
  topProducts: TopProduct[] = [];
  orders: any[] = [];

  selectedDate = new Date().toISOString().split('T')[0];
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().toISOString().slice(0, 7); // Định dạng YYYY-MM


  languageCode = 'vi';
  page = 0;
  size = 10;

  revenueChart: any = {
    series: [{
      name: 'Doanh thu',
      data: [0, 0, 0]  // Giá trị mặc định
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    xaxis: {
      categories: ['Ngày', 'Tháng', 'Năm']
    }
  };

  constructor(private revenueService: RevenueService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchRevenueData();
    this.loadTopProducts();

  }

  fetchRevenueData() {
    const month = parseInt(this.selectedMonth.split('-')[1], 10);


    this.revenueService.getDailyRevenue(this.selectedDate).subscribe({
      next: (response: number) => {
        console.log("Doanh thu ngày nhận được:", response);
        this.dailyRevenue = response; // Không còn response.data nữa
      },
      error: (err) => console.error('Lỗi khi lấy doanh thu ngày:', err)
    });

    this.revenueService.getMonthlyRevenue(this.selectedYear, month).subscribe({
      next: (response: number) => {
        console.log("Doanh thu tháng nhận được:", response);
        this.monthlyRevenue = response;
        this.updateChart();
      },
      error: (err) => console.error('Lỗi khi lấy doanh thu tháng:', err)
    });

    this.revenueService.getYearlyRevenue(this.selectedYear).subscribe({
      next: (response: number) => {
        console.log("Doanh thu năm nhận được:", response);
        this.yearlyRevenue = response;
      },
      error: (err) => console.error('Lỗi khi lấy doanh thu năm:', err)
    });

  }


  loadTopProducts() {
    this.revenueService.getTopSellingProducts(this.languageCode, this.page, this.size).subscribe({
      next: (response: ApiResponse<PageResponse<TopProduct>>) => {
        if (response && response.data && response.data.content) {
          this.topProducts = response.data.content;
        } else {
          console.warn('Không có dữ liệu sản phẩm bán chạy');
          this.topProducts = []; // Gán danh sách rỗng để tránh lỗi
        }
      },
      error: (err) => console.error('Lỗi lấy danh sách sản phẩm bán chạy:', err),
    });
  }

  getImageProduct(imageUrl: string | null): string {
    return imageUrl ? `http://localhost:8080/uploads/images/products/${imageUrl}` : 'assets/images/default-product.png';
  }

  updateChart() {
    this.revenueChart = {
      ...this.revenueChart,
      series: [{
        name: 'Doanh thu',
        data: [
          this.dailyRevenue || 0,
          this.monthlyRevenue || 0,
          this.yearlyRevenue || 0
        ],
      }],
    };
    this.cdr.detectChanges();
  }





}
