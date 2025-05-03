import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from 'chart.js/auto';
import {NgChartsModule} from 'ng2-charts';
import {DecimalPipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-store-city-revenue-chart',
  standalone: true,
  imports: [
    NgChartsModule,
    NgForOf,
    DecimalPipe
  ],
  templateUrl: './store-city-revenue-chart.component.html',
  styleUrl: './store-city-revenue-chart.component.scss'
})
export class StoreCityRevenueChartComponent implements OnInit{
  @Input() data: any[] = [];

  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      xRevenue: { // Trục X cho doanh thu
        position: 'top',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (VND)'
        },
        stacked: false
      },
      xStoreCount: { // Trục X cho số cửa hàng
        position: 'bottom',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Stores'
        },
        stacked: false,
        ticks: {
          stepSize: 1, // Chỉ số nguyên
          callback: (value) => Number(value).toLocaleString('vi-VN')
        }
      },
      y: {
        stacked: false,
        title: {
          display: true,
          text: 'City'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            let value = context.parsed.x;
            if (label.includes('Doanh thu')) {
              return `${label}: ${value.toLocaleString()} VND`;
            }
            return `${label}: ${Math.round(value)}`;
          }
        }
      }
    }
  };


  ngOnInit() {
    this.prepareChartData();
  }

  ngOnChanges() {
    this.prepareChartData();
  }

  private prepareChartData() {
    this.barChartData = {
      labels: this.data.map(item => item.city),
      datasets: [
        {
          label: 'Revenue (VND)',
          data: this.data.map(item => item.totalRevenue),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          xAxisID: 'xRevenue' // Gán cho trục doanh thu
        },
        {
          label: 'Number of Stores',
          data: this.data.map(item => Math.round(item.storeCount)),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          xAxisID: 'xStoreCount' // Gán cho trục số cửa hàng
        }
      ]
    };
  }

}
