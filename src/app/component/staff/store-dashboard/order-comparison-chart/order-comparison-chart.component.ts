import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-order-comparison-chart',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './order-comparison-chart.component.html',
  styleUrl: './order-comparison-chart.component.scss'
})
export class OrderComparisonChartComponent implements OnChanges {
  @Input() customerOrder: number = 0;
  @Input() guessOrder: number = 0;

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end', // Đặt label trên đỉnh cột
        align: 'top',
        color: '#333',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value) => value.toLocaleString() // Format số dễ đọc hơn
      }
    },
    scales: {
      x: {
        ticks: { color: '#333' }
      },
      y: {
        ticks: { color: '#333' }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Customer Orders', 'Guest Orders'],
    datasets: [
      {
        data: [],
        label: 'Orders',
        backgroundColor: ['rgba(76, 175, 80, 0.6)', 'rgba(255, 152, 0, 0.6)'],
        borderColor: ['#388E3C', '#E65100'],
        borderWidth: 1
      }
    ]
  };

  public chartPlugins = [ChartDataLabels]; // Thêm plugin vào biểu đồ

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customerOrder'] || changes['guessOrder']) {
      this.updateChart();
    }
  }

  private updateChart() {
    const maxValue = Math.max(this.customerOrder, this.guessOrder, 0); // Giá trị lớn nhất
    const suggestedMax = maxValue * 1.2; // Tăng 20% để tránh đụng trần

    // Cập nhật lại `barChartOptions` với `suggestedMax`
    this.barChartOptions = {
      ...this.barChartOptions,
      scales: {
        x: { ticks: { color: '#333' } },
        y: {
          beginAtZero: true,
          suggestedMax, // Áp dụng giá trị trần mới
          ticks: { color: '#333', callback: (value) => `${value.toLocaleString()}` }
        }
      }
    };

    // Cập nhật dữ liệu biểu đồ
    this.barChartData = structuredClone({
      labels: ['Customer Orders', 'Guest Orders'],
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: [this.customerOrder, this.guessOrder]
        }
      ]
    });
  }

}
