import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-monthly-revenue-chart',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './monthly-revenue-chart.component.html',
  styleUrl: './monthly-revenue-chart.component.scss'
})
export class MonthlyRevenueChartComponent implements OnChanges {
  @Input() revenueData: number[] = [];
  @Input() labels: string[] = [];

  public chartPlugins = [ChartDataLabels];

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#333', // Màu chữ của giá trị hiển thị
        anchor: 'end', // Định vị nhãn trên đỉnh
        align: 'top',  // Căn chỉnh phía trên
        font: { weight: 'bold' },
        formatter: (value) => `${value.toLocaleString()} VND` // Hiển thị dạng số có dấu phân cách
      }
    }


  };

  public chartType: 'line' = 'line';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: `Revenue ${new Date().getFullYear()}`,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4CAF50',
        borderWidth: 2,
        pointBackgroundColor: '#388E3C',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#388E3C',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['revenueData'] || changes['labels']) {
      const maxValue = Math.max(...this.revenueData, 0);
      const suggestedMax = maxValue * 1.2;

      this.lineChartOptions = {
        ...this.lineChartOptions,
        scales: {
          x: { ticks: { color: '#333' } },
          y: {
            beginAtZero: true,
            suggestedMax, // Thiết lập giá trị trần động
            ticks: { color: '#333', callback: (value) => `${value.toLocaleString()}` }
          }
        }
      };

      this.lineChartData = {
        labels: [...this.labels],
        datasets: [
          {
            ...this.lineChartData.datasets[0],
            data: [...this.revenueData]
          }
        ]
      };
    }
  }
}
