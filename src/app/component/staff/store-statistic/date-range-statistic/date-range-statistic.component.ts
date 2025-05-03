import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../../../services/client/store/store.service';
import { StoreRevenueByDateRangeResponse } from '../../../../dto/store/StoreRevenueByDateRangeResponse';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-date-range-statistic',
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
  templateUrl: './date-range-statistic.component.html',
  styleUrl: './date-range-statistic.component.scss'
})
export class DateRangeStatisticComponent implements OnInit {
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
    this.route.parent?.parent?.paramMap.subscribe((params) => {
      const storeId = params.get('storeId');
      if (storeId) {
        this.storeId = Number(storeId);
      }
    });
    this.fetchRevenueData();
  }

  goToDailyChart(month: number, year: number): void {
    const storeId = this.route.parent?.parent?.snapshot.paramMap.get('storeId');
    if (storeId) {
      this.router.navigate([`/staff/${storeId}/store-statistic/daily-statistic`], {
        queryParams: { month, year }
      });
    }
  }

  goToOrders(month: number, year: number): void {
    const storeId = this.route.parent?.parent?.snapshot.paramMap.get('storeId');
    if (storeId) {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01T00:00:00`;
      const endDate = new Date(year, month, 0); // Lấy ngày cuối cùng của tháng
      const endDateStr = `${year}-${month.toString().padStart(2, '0')}-${endDate.getDate()}T23:59:59`;

      this.router.navigate([`/staff/${storeId}/store-order`], {
        queryParams: { startDate, endDate: endDateStr }
      });
    }
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
