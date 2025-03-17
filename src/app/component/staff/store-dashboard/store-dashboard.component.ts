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

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [
    StoreHeaderComponent,
    TopProductsTableComponent,
    LastestOrderComponent
  ],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.scss'
})
export class StoreDashboardComponent implements OnInit{
  topProducts: TopProduct[] = [];
  orders: LatestOrderDetailResponse[] = [];
  storeId = 0;

  topProductsPage = 0;
  topProductsTotalPages = 1;


  ordersPage = 0;
  ordersTotalPages = 1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private userService: UserService,
    private storeService: StoreService,
    private staffService: StaffService) {
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      this.storeId = Number(params.get('storeId')) ?? '0';
    });
    this.fetchTopProducts();
    this.fetchLatestOrders();
  }

  // fetchTopProducts(): void {
  //   this.storeService.getTopProducts(this.storeId, this.page, this.size).subscribe((response: any) => {
  //     this.topProducts = response.data.content;
  //   });
  // }

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

  // Phân trang cho Orders
  onOrdersPageChange(newPage: number): void {
    this.ordersPage = newPage;
    this.fetchLatestOrders();
  }
}
