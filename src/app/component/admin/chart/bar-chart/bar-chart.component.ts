import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements AfterViewInit {
  @Input() lable: string[] = [];
  @Input() lable_col: string[] = [];
  @Input() data_col_one: any[] = [];
  @Input() data_col_two: any[] = [];

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    this.createBarChart();
  }

  createBarChart() {
    let datasets: any[];

    if (this.data_col_two.length > 0) {
      datasets = [
        {
          label: this.lable_col[0],
          data: this.data_col_one,
          backgroundColor: 'rgba(255, 99, 132, 0.2)', // First column color
          borderColor: 'rgb(255, 99, 132)', // First column border
          borderWidth: 1
        },
        {
          label: this.lable_col[1],
          data: this.data_col_two,
          backgroundColor: 'rgba(153, 102, 255, 0.2)', // Second column color
          borderColor: 'rgb(153, 102, 255)', // Second column border
          borderWidth: 1
        }
      ];
    } else {
      datasets = [
        {
          label: 'First Dataset',
          data: this.data_col_one,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }
      ];
    }

    // Chart data
    const chartData = {
      labels: this.lable,
      datasets: datasets
    };

    // Chart configuration
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: chartData,
      options: {
        plugins: {
          legend: {
            position: 'bottom', // Đặt legend ở trên cùng
            labels: {
              padding: 10, // Tăng khoảng cách giữa các nhãn trong legend
              boxWidth: 20, // Kích thước khung màu của legend
              font: {
                size: 12 // Kích thước chữ của legend
              }
            }
          },
          datalabels: {
            display: true,  
            color: 'black',  
            anchor: 'end',  
            align: 'top',  
            font: {
              size: 12 // Kích thước chữ
            },
            formatter: (value: number) => value.toLocaleString() // Định dạng giá trị
          }
        },
        scales: {
          x: {
            ticks: {
              padding: 0 // Thêm khoảng cách (margin-bottom)
            }
          },
          y: {
            beginAtZero: true
          }
        }
      },
      plugins: [DataLabelsPlugin] // Thêm plugin DataLabels vào biểu đồ
    };

    // Create chart context and initialize chart
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    new Chart(ctx, config);
  }
}
