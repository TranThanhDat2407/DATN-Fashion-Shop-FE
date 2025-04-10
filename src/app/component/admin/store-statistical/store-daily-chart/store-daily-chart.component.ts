import {Component, OnInit} from '@angular/core';
import {CommonModule, CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgChartsModule} from "ng2-charts";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {StoreService} from '../../../../services/client/store/store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StoreDailyRevenueResponse} from '../../../../dto/store/StoreDailyRevenueResponse';

@Component({
  selector: 'app-store-daily-chart',
  standalone: true,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      NgChartsModule,
    ],
  templateUrl: './store-daily-chart.component.html',
  styleUrl: './store-daily-chart.component.scss'
})
export class StoreDailyChartComponent implements OnInit{
  public chartData: any[] = [];
  public chartLabels: string[] = [];
  public chartPlugins = [ChartDataLabels];

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

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  storeId = 0;
  month: number = new Date().getMonth() + 1; // Mặc định là tháng hiện tại
  year: number = new Date().getFullYear(); // Mặc định là năm hiện tại

  months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`
  }));

  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);



  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.storeId = params['storeId'] ? Number(params['storeId']) : 0;
      this.month = params['month'] ? Number(params['month']) : new Date().getMonth() + 1;
      this.year = params['year'] ? Number(params['year']) : new Date().getFullYear();

      if (this.storeId) {
        this.fetchRevenueData();
      }
    });
  }

  goToOrders(day: number, month: number, year: number): void {
    const storeId = this.route.parent?.parent?.snapshot.paramMap.get('storeId');
    if (storeId) {
      const formattedDay = day.toString().padStart(2, '0');
      const formattedMonth = month.toString().padStart(2, '0');

      const startDate = `${year}-${formattedMonth}-${formattedDay}T00:00:00`;
      const endDate = `${year}-${formattedMonth}-${formattedDay}T23:59:59`;


      this.router.navigate([`/staff/${storeId}/store-order`], {
        queryParams: { startDate, endDate }
      });
    }
  }

  exportRevenue(): void {
    this.storeService.exportDailyRevenueByMonthAndYear(this.storeId, this.month, this.year)
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

  fetchRevenueData(): void {
    const storeId = this.storeId;

    this.storeService.getDailyRevenue(storeId, this.month, this.year).subscribe({
      next: (data: StoreDailyRevenueResponse[]) => {
        this.prepareChartData(data);
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      },
    });
  }

  public revenueList: StoreDailyRevenueResponse[] = [];
  public totalRevenueSum: number = 0;

  prepareChartData(data: StoreDailyRevenueResponse[]): void {
    this.chartData = [];
    this.chartLabels = [];
    this.revenueList = [];
    this.totalRevenueSum = 0;

    const revenueData: number[] = [];

    data.forEach((item) => {
      this.chartLabels.push(`${item.day}`);
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
