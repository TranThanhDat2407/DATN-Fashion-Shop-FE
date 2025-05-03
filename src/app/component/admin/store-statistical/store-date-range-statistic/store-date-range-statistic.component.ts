import {Component, OnInit} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatFormField, MatFormFieldModule, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {NgChartsModule} from "ng2-charts";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {StoreService} from '../../../../services/client/store/store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StoreRevenueByDateRangeResponse} from '../../../../dto/store/StoreRevenueByDateRangeResponse';
import {MatNativeDateModule} from '@angular/material/core';
import {Store} from '../../../../models/Store/Store';
import {catchError, of} from 'rxjs';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {PageResponse} from '../../../../dto/Response/page-response';
import {ListStoreDTO} from '../../../../dto/ListStoreDTO';

@Component({
  selector: 'app-store-date-range-statistic',
  standalone: true,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      NgChartsModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatFormFieldModule,
      MatButtonModule,
      MatInputModule
    ],
  providers: [DatePipe],
  templateUrl: './store-date-range-statistic.component.html',
  styleUrl: './store-date-range-statistic.component.scss'
})
export class StoreDateRangeStatisticComponent implements OnInit {
  public chartData: any[] = [];
  public chartLabels: string[] = [];
  public chartPlugins = [ChartDataLabels];
  storeId = 0;
  public chartOptions: any = {
    responsive: true,
    plugins: {
      datalabels: {
        color: '#333', // Màu chữ
        anchor: 'end', // Định vị nhãn trên đỉnh
        align: 'top',  // Căn chỉnh phía trên
        font: { weight: 'bold' },
        formatter: (value: number) => `${value.toLocaleString()} VND` // Định dạng số có dấu phân cách
      }
    },

    scales: { y: { beginAtZero: true } },
  };

  public chartLegend = false;
  public chartType: 'line' = 'line';

  public startDate = new FormControl<Date | null>(null);
  public endDate = new FormControl<Date | null>(null);



  constructor(
    private storeService: StoreService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.startDate.setValue(new Date(currentYear, 0, 1));
    this.endDate.setValue(new Date(currentYear, 11, 31));

    this.loadStores();

    // Watch for store selection changes
    this.storeFormControl.valueChanges.subscribe(storeId => {
      if (storeId) {
        this.storeId = storeId;
        this.fetchRevenueData();
      }
    });
  }

  selectedStoreId: number | null = null;
  storeFormControl = new FormControl<number | null>(null);
  dataStore: ListStoreDTO[] = [];

  loadStores(): void {
    this.storeService.getStores(
      0,      // pageNo
      100,    // pageSize - lấy đủ lớn để load tất cả store
      '',     // city - không filter
      0,      // userLat - không dùng
      0       // userLon - không dùng
    ).pipe(

    ).subscribe(response => {
      this.dataStore = response.data?.content || [];
      if (this.dataStore.length > 0) {
        this.selectedStoreId = this.dataStore[0].id;
        this.storeId = this.dataStore[0].id;
        this.storeFormControl.setValue(this.dataStore[0].id);
        this.fetchRevenueData(); // Load data for first store
      }
    });
  }

  goToDailyChart(month: number, year: number): void {
    if (!this.storeId) {
      console.error('Vui lòng chọn cửa hàng trước');
      return;
    }

    this.router.navigate(['/admin/store-statistical/daily-statistic'], {
      queryParams: {
        storeId: this.storeId,
        month,
        year
      }
    });
  }

  goToOrders(): void {

    // const storeId = this.route.parent?.parent?.snapshot.paramMap.get('storeId');
    //
    // if (storeId) {
    //   const startDate = `${year}-${month.toString().padStart(2, '0')}-01T00:00:00`;
    //   const endDate = new Date(year, month, 0); // Lấy ngày cuối cùng của tháng
    //   const endDateStr = `${year}-${month.toString().padStart(2, '0')}-${endDate.getDate()}T23:59:59`;
    //
    //   this.router.navigate([`/staff/${storeId}/store-order`], {
    //     queryParams: { startDate, endDate: endDateStr }
    //   });
    // }
    if (!this.storeId || !this.startDate.value || !this.endDate.value) {
      console.error('Vui lòng chọn cửa hàng và khoảng thời gian');
      return;
    }

    const startDateStr = this.formatApiDate(this.startDate.value);
    const endDateStr = this.formatApiDate(this.endDate.value);

    this.router.navigate(['/admin/list_order'], {
      queryParams: {
        storeId: this.storeId,
        fromDate: startDateStr,
        toDate: endDateStr
      }
    });



  }

  exportRevenueByDateRange(): void {
    if (!this.startDate.value || !this.endDate.value) {
      console.error('Start date and end date are required!');
      return;
    }

    const startDateStr = this.formatApiDate(this.startDate.value);
    const endDateStr = this.formatApiDate(this.endDate.value);


    this.storeService.exportRevenueByDateRange(this.storeId, startDateStr, endDateStr)
      .subscribe(response => {
        const blob = new Blob([response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue_data.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Export failed', error);
      });
  }

  setStartMonth(event: Date, datepicker: any): void {
    this.startDate.setValue(event);
    datepicker.close();
  }

  setEndMonth(event: Date, datepicker: any): void {
    this.endDate.setValue(event);
    datepicker.close();
  }

  formatApiDate(date: Date | null): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd') + 'T00:00:00' : '';
  }

  fetchRevenueData(): void {
    if (!this.startDate.value || !this.endDate.value) {
      alert('Vui lòng chọn cả tháng bắt đầu và tháng kết thúc.');
      return;
    }

    const storeId = this.storeId;
    const startDateStr = this.formatApiDate(this.startDate.value);
    const endDateStr = this.formatApiDate(this.endDate.value);

    this.storeService.getRevenueByDateRange(storeId, startDateStr, endDateStr).subscribe({
      next: (data: StoreRevenueByDateRangeResponse[]) => {
        this.prepareChartData(data);
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      },
    });
  }

  public revenueList: StoreRevenueByDateRangeResponse[] = [];
  public totalRevenueSum: number = 0;

  prepareChartData(data: StoreRevenueByDateRangeResponse[]): void {
    this.chartData = [];
    this.chartLabels = [];
    this.revenueList = [];
    this.totalRevenueSum = 0;

    const revenueData: number[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    data.forEach((item) => {
      this.chartLabels.push(`${monthNames[item.month - 1]}/${item.year}`);
      revenueData.push(item.totalRevenue);
    });

    this.revenueList = data.filter(item => item.totalRevenue > 0);

    this.totalRevenueSum = this.revenueList.reduce((sum, item) => sum + item.totalRevenue, 0);

    const maxValue = revenueData.length > 0 ? Math.max(...revenueData) : 0;
    const suggestedMax = maxValue * 1.2;

    this.chartData = [
      {
        label: 'Doanh thu',
        data: revenueData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ];

    this.chartOptions = {
      ...this.chartOptions,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax, // Áp dụng trần tối đa mới
        },
      },
    };
  }
}
