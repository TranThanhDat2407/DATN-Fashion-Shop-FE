import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { HeaderAdminComponent } from '../header-admin/header-admin.component';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { BarChartComponent } from '../chart/bar-chart/bar-chart.component';
import { LineChartComponent } from '../chart/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../chart/doughnut-chart/doughnut-chart.component';
import { TableComponent } from '../table/table.component';
import { MenuComponent } from '../menu/menu.component';
import {CommonModule, CurrencyPipe, DecimalPipe, NgForOf, NgIf, NgStyle} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticService } from '../../../services/admin/StatisticService/statistic.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { response } from 'express';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { RevenueToday } from '../../../dto/admin/RevenueToday';
import { OrderToday } from '../../../dto/admin/OrderToday';
import { OrderCancel } from '../../../dto/admin/OrderCancel';
import { CustomerAccoutToday } from '../../../dto/admin/CustomerAccoutToday';
import {ChartOptions} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {PageResponse} from '../../../dto/Response/page-response';
import {RevenueService} from '../../../services/admin/RevenueService/revenue.service';
import {NgChartsModule} from 'ng2-charts';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatInputModule} from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';
import {MatNativeDateModule} from '@angular/material/core';

export interface TableDataModel {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
  parentsID: number;
  parentsName: string;
  createAt: string;
  updateAt: string;
}
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
  selector: 'app-dashboard',
  standalone: true,
  imports: [MenuComponent, HeaderAdminComponent, RouterLink, BarChartComponent, TableComponent
    , LineChartComponent, DoughnutChartComponent, CommonModule, FormsModule, NgChartsModule, NgxPaginationModule,
    CurrencyPipe,
    NgStyle,
    NgIf,
    NgForOf,
    DecimalPipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentPage: number = 1;
  dailyRevenue: number = 0;
  monthlyRevenue: number = 0;
  yearlyRevenue: number = 0;
  topProducts: TopProduct[] = [];
  orders: any[] = [];

  selectedDate = new Date().toISOString().split('T')[0];
  selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  selectedYear = new Date().getFullYear();


  languageCode = 'vi';
  page = 0;
  size = 10;

  chartType: ChartType = 'bar';





  revenueChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Weekly revenue',
        data: [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56'],
        borderWidth: 1
      }
    ]
  };

  revenueChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#000', // Màu chữ hiển thị trên biểu đồ
        font: { weight: 'bold', size: 12 },
        formatter: (value: number) => `${value.toLocaleString('vi-VN')} VND`
      }
    }
  };
  revenueChartPlugins = [ChartDataLabels];

  dataRevenueToday: RevenueToday | null = null
  dataRevenueYesteday: number = 0

  dataOrderToday : OrderToday | null = null
  dataOrderYesterday: number = 0

  dataOrderCancelToday : OrderCancel | null = null
  dataOrderCancelYesterday: number = 0

  dataCustomerAccountToday : CustomerAccoutToday | null = null
  dataCustomerAccountYesterday: number = 0

  constructor(
    private statisticService: StatisticService,
  private revenueService: RevenueService, private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    this.fetchRevenueData();
    this.loadTopProducts();
    // this.fetchDailyRevenue();
    // this.fetchMonthlyRevenue();
    // this.fetchYearlyRevenue();
    this.fetchDashboard();
    this.getRevenueYesterday().subscribe(response => {

    });

  }


  async fetchDashboard(): Promise<void> {

    const callApis = {
      dataRevenueToday: this.getRevenueToday().pipe(catchError(() => of(null))),
      dataRevenueYesteday: this.getRevenueYesterday().pipe(catchError(() => of(null))),
      dataOrderToday: this.getOrderToday().pipe(catchError(() => of(null))),
      dataOrderYesterday: this.getOrderYesterday().pipe(catchError(() => of(null))),
      dataOrderCancelToday: this.getOrderCancelToday().pipe(catchError(() => of(null))),
      dataOrderCancelYesterday: this.getOrderCancelYesterday().pipe(catchError(() => of(null))),
      dataCustomerAccountToday: this.getCustomerAccountToday().pipe(catchError(() => of(null))),
      dataCustomerAccountYesterday: this.getCustomerAccountYesterday().pipe(catchError(() => of(null))),

    }

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataRevenueToday = response.dataRevenueToday
    this.dataRevenueYesteday = response.dataRevenueYesteday?.data ?? 0;

    this.dataOrderToday = response.dataOrderToday
    this.dataOrderYesterday = response.dataOrderYesterday?.data ?? 0;

    this.dataOrderCancelToday = response.dataOrderCancelToday
    this.dataOrderCancelYesterday = response.dataOrderCancelYesterday?.data ?? 0;


    this.dataCustomerAccountToday = response.dataCustomerAccountToday
    this.dataCustomerAccountYesterday = response.dataCustomerAccountYesterday?.data ?? 0;

    console.log('dataRevenueYesteday : '+ this.dataCustomerAccountToday)

  }


  getRevenueToday(): Observable<RevenueToday | null> {
    return this.statisticService.getRevenueToday().pipe(
      map((response: ApiResponse<RevenueToday>) => response.data),
      catchError(() => of(null))
    )
  }

  getOrderToday(): Observable<OrderToday | null> {
    return this.statisticService.getOrderToday().pipe(
      map((response: ApiResponse<OrderToday>) => response.data),
      catchError(() => of(null))
    )
  }

  getOrderCancelToday(): Observable<OrderCancel | null> {
    return this.statisticService.getOrderCancelToday().pipe(
      map((response: ApiResponse<OrderCancel>) => response.data),
      catchError(() => of(null))
    )
  }
  getCustomerAccountToday(): Observable<CustomerAccoutToday | null> {
    return this.statisticService.getCustomerAccountToday().pipe(
      map((response: ApiResponse<CustomerAccoutToday>) => response.data),
      catchError(() => of(null))
    )
  }



  getRevenueYesterday(): Observable<ApiResponse<number> | null> {
    return this.statisticService.getRevenueYesterday().pipe(
      map((response: ApiResponse<number>) => response),
      catchError(() => of(null))
    )
  }

  getOrderYesterday(): Observable<ApiResponse<number> | null> {
    return this.statisticService.getOrderYesterday().pipe(
      map((response: ApiResponse<number>) => response),
      catchError(() => of(null))
    )
  }

  getOrderCancelYesterday(): Observable<ApiResponse<number> | null> {
    return this.statisticService.getOrderCancelYesterday().pipe(
      map((response: ApiResponse<number>) => response),
      catchError(() => of(null))
    )
  }
  getCustomerAccountYesterday(): Observable<ApiResponse<number> | null> {
    return this.statisticService.getCustomerAccountYesterday().pipe(
      map((response: ApiResponse<number>) => response),
      catchError(() => of(null))
    )
  }

  percent(numberToday: number, numberYesterday: number): number {
    if (numberYesterday === 0) {
      return numberToday === 0 ? 0 : 100; // Nếu cả hai bằng 0, trả về 0. Nếu chỉ numberYesterday = 0, trả về 100%.
    }

    return ((numberToday - numberYesterday) / numberYesterday) * 100;
  }

  fetchRevenueData() {
    const last7Days = this.getLast7Days();
    this.revenueChartData.labels = ['Monday', 'Tuesday', 'Thứ Tư', 'Wednesday', 'Friday', 'Saturday', 'Sunday'];

    let revenueData: number[] = new Array(7).fill(0);
    let completedRequests = 0;

    last7Days.forEach((date, index) => {
      this.revenueService.getDailyRevenue(date).subscribe({
        next: (response: number) => {
          revenueData[index] = response || 0;
          completedRequests++;

          // Cập nhật biểu đồ khi tất cả dữ liệu đã tải xong
          if (completedRequests === last7Days.length) {
            this.updateChart(revenueData);
          }
        },
        error: (err) => {
          console.error(`Lỗi khi lấy doanh thu ngày ${date}:`, err);
          completedRequests++;

          if (completedRequests === last7Days.length) {
            this.updateChart(revenueData);
          }
        }
      });
    });
  }


  getLast7Days(): string[] {
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Chủ Nhật) -> 6 (Thứ Bảy)
    const days: string[] = [];

    // Tìm ngày đầu tuần (Thứ Hai)
    const monday = new Date();
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    // Lấy 7 ngày liên tiếp từ Thứ Hai -> Chủ Nhật
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
    }

    return days;
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


  loadTopProducts() {
    this.revenueService.getTopSellingProducts(this.languageCode, this.page, this.size).subscribe({
      next: (response: ApiResponse<PageResponse<TopProduct>>) => {
        if (response?.data?.content) {
          this.topProducts = response.data.content;
        } else {
          this.topProducts = [];
        }
      },
      error: (err) => console.error('Lỗi lấy danh sách sản phẩm bán chạy:', err),
    });
  }

  updateChart(revenueData: number[]) {
    this.revenueChartData.datasets[0].data = revenueData;
    this.cdr.detectChanges();
  }


  getImageProduct(imageUrl: string | null): string {
    return imageUrl ? `http://localhost:8080/uploads/images/products/${imageUrl}` : 'assets/images/default-product.png';
  }


}
