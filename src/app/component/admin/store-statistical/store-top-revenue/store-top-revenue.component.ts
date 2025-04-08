import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from 'chart.js/auto';
import {NgChartsModule} from 'ng2-charts';
import {DecimalPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-store-top-revenue',
  standalone: true,
  imports: [
    NgChartsModule,
    DecimalPipe,
    NgForOf
  ],
  templateUrl: './store-top-revenue.component.html',
  styleUrl: './store-top-revenue.component.scss'
})
export class StoreTopRevenueComponent implements OnInit{
  @Input() data: any[] = [];

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'x', // Chuyển biểu đồ từ ngang sang dọc
    scales: {
      x: {
        title: {
          display: true,
          text: 'Store'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (VND)'
        },
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('vi-VN').format(Number(value));
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const store = this.data[context.dataIndex];
            return [
              `Store: ${store.storeName}`,
              `City: ${store.city}`,
              `Revenue: ${context.parsed.y.toLocaleString('vi-VN')} VND`
            ];
          }
        }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Revenue',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  ngOnInit(): void {
    this.updateChart();
  }

  ngOnChanges(): void {
    this.updateChart();
  }

  private updateChart(): void {
    this.barChartData = {
      labels: this.data.map(store => `${store.storeName} (${store.city})`),
      datasets: [{
        label: 'Revenue',
        data: this.data.map(store => store.totalRevenue),
        backgroundColor: this.data.map(store =>
          store.totalRevenue > 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
        borderColor: this.data.map(store =>
          store.totalRevenue > 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
        borderWidth: 1
      }]
    };
  }
}
