import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
@Component({
  selector: 'app-weekly-revenue-chart',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './weekly-revenue-chart.component.html',
  styleUrl: './weekly-revenue-chart.component.scss'
})
export class WeeklyRevenueChartComponent implements OnChanges {

  @Input() revenueData: number[] = [];
  @Input() labels: string[] = [];

  public chartPlugins = [ChartDataLabels];
  public barChartOptions: ChartOptions<'bar'> = {
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

    },
  };

  public chartType: 'bar' = 'bar';

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Weekly Revenue',
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: '#4CAF50',
        borderWidth: 1
      }
    ]
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['revenueData'] || changes['labels']) {
      this.updateChart();
    }
  }

  private updateChart() {
    const maxValue = Math.max(...this.revenueData, 0);
    const suggestedMax = maxValue * 1.2;

    this.barChartOptions = {
      ...this.barChartOptions,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax,
        }
      }
    };

    this.barChartData = structuredClone({
      labels: this.labels,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: this.revenueData
        }
      ]
    });
  }

}
