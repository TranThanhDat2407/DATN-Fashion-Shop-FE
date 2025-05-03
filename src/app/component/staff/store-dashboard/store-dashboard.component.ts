import {Component, OnInit} from '@angular/core';
import {BarChartComponent} from '../../admin/chart/bar-chart/bar-chart.component';
import {DoughnutChartComponent} from '../../admin/chart/doughnut-chart/doughnut-chart.component';
import {HeaderAdminComponent} from '../../admin/header-admin/header-admin.component';
import {LineChartComponent} from '../../admin/chart/line-chart/line-chart.component';
import {TableComponent} from '../../admin/table/table.component';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {TableDataModel} from '../../admin/dashboard/dashboard.component';
import {TopProduct, TopProductsTableComponent} from './top-products-table/top-products-table.component';
import {ActivatedRoute, Router} from '@angular/router';
import {TokenService} from '../../../services/token/token.service';
import {UserService} from '../../../services/user/user.service';
import {StoreService} from '../../../services/client/store/store.service';
import {StaffService} from '../../../services/staff/staff.service';
import {StoreOrderDetailResponse} from '../../../dto/store/StoreOrderDetailResponse';
import {LastestOrderComponent} from './lastest-order/lastest-order.component';
import {LatestOrderDetailResponse} from '../../../dto/store/LatestOrderDetailReponse';
import {MonthlyRevenueChartComponent} from './monthly-revenue-chart/monthly-revenue-chart.component';
import {WeeklyRevenueChartComponent} from './weekly-revenue-chart/weekly-revenue-chart.component';
import {OrderComparisonChartComponent} from './order-comparison-chart/order-comparison-chart.component';
import {CurrencyPipe} from '@angular/common';
import {PaymentComparisonChartComponent} from './payment-comparison-chart/payment-comparison-chart.component';
import {UnsoldTableComponent} from './unsold-table/unsold-table.component';
import {InventoryService, InventoryStatusResponse} from '../../../services/admin/InventoryService/inventory.service';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [
    StoreHeaderComponent,
    TopProductsTableComponent,
    LastestOrderComponent,
    MonthlyRevenueChartComponent,
    WeeklyRevenueChartComponent,
    OrderComparisonChartComponent,
    CurrencyPipe,
    PaymentComparisonChartComponent,
    UnsoldTableComponent
  ],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.scss'
})
export class StoreDashboardComponent implements OnInit{
  topProducts: TopProduct[] = [];
  orders: LatestOrderDetailResponse[] = [];
  storeId = 0;

  currentYear: number = new Date().getFullYear();
  topProductsPage = 0;
  topProductsTotalPages = 1;


  ordersPage = 0;
  ordersTotalPages = 1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private userService: UserService,
    private inventoryService: InventoryService,
    private storeService: StoreService,
    private staffService: StaffService) {
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.storeId = Number(params.get('storeId')) ?? '0';
    });
    this.fetchTopProducts();
    this.fetchLatestOrders();
    this.loadMonthlyRevenue();
    this.loadWeeklyRevenue();
    this.loadOrderComparison();
    this.loadPaymentComparison();
    this.fetchDashboardData(this.storeId);
    this.loadUnsoldProducts();
  }

  // fetchTopProducts(): void {
  //   this.storeService.getTopProducts(this.storeId, this.page, this.size).subscribe((response: any) => {
  //     this.topProducts = response.data.content;
  //   });
  // }
  totalRevenueToday: number = 0;
  totalRevenueThisMonth: number = 0;
  totalOrdersToday: number = 0;
  totalOrdersThisMonth: number = 0;
  fetchDashboardData(storeId: number): void {

    this.storeService.getTotalRevenueToday(storeId).subscribe({
      next: (response: number) => {
        this.totalRevenueToday = response;
      },
      error: (error) => {
        console.error('Lỗi khi lấy doanh thu hôm nay:', error);
      },
    });

    this.storeService.getTotalRevenueThisMonth(storeId).subscribe({
      next: (response: number) => {
        this.totalRevenueThisMonth = response;
      },
      error: (error) => {
        console.error('Lỗi khi lấy doanh thu tháng này:', error);
      },
    });

    this.storeService.getTotalOrdersToday(storeId).subscribe({
      next: (response: number) => {
        this.totalOrdersToday = response;
      },
      error: (error) => {
        console.error('Lỗi khi lấy tổng đơn hàng hôm nay:', error);
      },
    });

    this.storeService.getTotalOrdersThisMonth(storeId).subscribe({
      next: (response: number) => {
        this.totalOrdersThisMonth = response;
      },
      error: (error) => {
        console.error('Lỗi khi lấy tổng đơn hàng tháng này:', error);
      },
    });
  }

  fetchTopProducts(): void {
    this.storeService.getTopProducts(this.storeId,  this.topProductsPage, 5).subscribe((response: any) => {
      this.topProducts = response.data.content;
      this.topProductsTotalPages = response.data.totalPages;
    });
  }

  fetchLatestOrders(): void {
    this.storeService.getLatestOrders(this.storeId, this.ordersPage, 5).subscribe((response: any) => {
      this.orders = response.data.content;
      this.ordersTotalPages = response.data.totalPages;
    });
  }

  onTopProductsPageChange(newPage: number): void {
    this.topProductsPage = newPage;
    this.fetchTopProducts();
  }

  onOrdersPageChange(newPage: number): void {
    this.ordersPage = newPage;
    this.fetchLatestOrders();
  }

  unsoldProducts: InventoryStatusResponse[] = [];
  unsoldPage = 0;
  unsoldTotalPages = 1;
  unsoldLoading = false;
  pageSize = 5;

// Thêm phương thức loadUnsoldProducts
  loadUnsoldProducts(): void {
    this.unsoldLoading = true;
    const langCode = 'vi';

    this.inventoryService.getUnsoldProducts(this.storeId, langCode, this.unsoldPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.unsoldProducts = response.data.content;
          this.unsoldTotalPages = response.data.totalPages;
          this.unsoldLoading = false;
        },
        error: (err) => {
          console.error('Error loading unsold products:', err);
          this.unsoldLoading = false;
        }
      });
  }

// Thêm phương thức xử lý thay đổi trang
  onUnsoldPageChange(newPage: number): void {
    this.unsoldPage = newPage;
    this.loadUnsoldProducts();
  }


  monthlyRevenueData: number[] = [];
  monthlyLabels: string[] = [];
  totalMonthlyRevenue: number = 0;
  loadMonthlyRevenue() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.storeService.getMonthlyRevenue(this.storeId).subscribe(response => {
      this.monthlyLabels = response.map((item: any) => monthNames[item.month - 1] || `Tháng ${item.month}`);
      this.monthlyRevenueData = response.map((item: any) => item.totalRevenue);
      this.totalMonthlyRevenue =
        this.monthlyRevenueData.reduce((sum, revenue) => sum + revenue, 0);
    });
  }

  weeklyRevenueData: number[] = [];
  weeklyLabels: string[] = [];
  totalWeeklyRevenue: number = 0;
  loadWeeklyRevenue() {
    const weekNames = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    this.storeService.getWeeklyRevenue(this.storeId).subscribe(response => {
      this.weeklyLabels = response.map((item: any) => weekNames[item.dayOfWeek - 1]); // Vì dayOfWeek = 1 là Sunday
      this.weeklyRevenueData = response.map((item: any) => item.revenue);
      this.totalWeeklyRevenue
        = this.weeklyRevenueData.reduce((sum, revenue) => sum + revenue, 0);
    });
  }

  customerOrder:  number = 0;
  guessOrder:  number = 0;
  loadOrderComparison() {
    this.storeService.getOrderComparison(this.storeId).subscribe(response => {
      this.customerOrder = response.customerOrder;
      this.guessOrder = response.guessOrder;
    });
  }

  cash:  number = 0;
  bankTransfer:  number = 0;
  loadPaymentComparison() {
    this.storeService.getPaymentComparison(this.storeId).subscribe(response => {
      this.cash = response.cash;
      this.bankTransfer = response.bankTransfer;
    });
  }


}
