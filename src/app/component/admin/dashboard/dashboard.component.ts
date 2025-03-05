import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../header-admin/header-admin.component';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { BarChartComponent } from '../chart/bar-chart/bar-chart.component';
import { LineChartComponent } from '../chart/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../chart/doughnut-chart/doughnut-chart.component';
import { TableComponent } from '../table/table.component';
import { MenuComponent } from '../menu/menu.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticService } from '../../../services/admin/StatisticService/statistic.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { response } from 'express';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { RevenueToday } from '../../../dto/admin/RevenueToday';
import { OrderToday } from '../../../dto/admin/OrderToday';
import { OrderCancel } from '../../../dto/admin/OrderCancel';
import { CustomerAccoutToday } from '../../../dto/admin/CustomerAccoutToday';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MenuComponent, HeaderAdminComponent, RouterLink, BarChartComponent, TableComponent
    , LineChartComponent, DoughnutChartComponent, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  labels = ['Jan', 'Feb', 'Mar', 'Apr'];
  data = [65, 59, 80, 81]


  lable2 = ['Jan', 'Feb', 'Mar'];
  lable_col = ['Order Qty  ', "Revenue"];
  data2 = [12, 19, 3];
  data_dou2 = [8, 15, 26];


  headers: string[] = ['id', 'name', 'imageUrl', 'parentsName', 'createAt', 'updateAt',];



  dataTable: TableDataModel[] = [
    {
      id: 1,
      name: 'Product A',
      imageUrl: 'https://im.uniqlo.com/global-cms/spa/res5531725dc496187c0b233c84e865bdd8fr.png',
      isActive: true,
      parentsID: 101,
      parentsName: 'Category A',
      createAt: '2024-01-01T12:00:00Z',
      updateAt: '2024-01-10T12:00:00Z'
    },
    {
      id: 2,
      name: 'Product B',
      imageUrl: 'https://im.uniqlo.com/global-cms/spa/res5531725dc496187c0b233c84e865bdd8fr.png',
      isActive: false,
      parentsID: 102,
      parentsName: 'Category B',
      createAt: '2024-01-05T10:30:00Z',
      updateAt: '2024-01-15T14:00:00Z'
    },
    {
      id: 3,
      name: 'Product C',
      imageUrl: 'https://im.uniqlo.com/global-cms/spa/res5531725dc496187c0b233c84e865bdd8fr.png',
      isActive: true,
      parentsID: 103,
      parentsName: 'Category C',
      createAt: '2024-02-01T08:00:00Z',
      updateAt: '2024-02-10T09:30:00Z'
    }
  ];

  dataRevenueToday: RevenueToday | null = null
  dataRevenueYesteday: number = 0
  
  dataOrderToday : OrderToday | null = null
  dataOrderYesterday: number = 0

  dataOrderCancelToday : OrderCancel | null = null
  dataOrderCancelYesterday: number = 0

  dataCustomerAccountToday : CustomerAccoutToday | null = null
  dataCustomerAccountYesterday: number = 0

  constructor(
    private statisticService: StatisticService

  ) { }

  async ngOnInit(): Promise<void> {
    this.fetchDashboard()
    this.getRevenueYesterday().subscribe(response => {
      console.log(response); // Kiểm tra dữ liệu trả về từ API
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

  




  percent(numberToday : number , numberYesterday : number): number {
      const total = ( (numberToday  - numberYesterday) / numberYesterday ) * 100 
    return total;
  }
}
