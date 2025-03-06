import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit {
  @Input() labels: string[] = [];
  @Input() datasetOne: number[] = [];
  @Input() datasetTwo: number[] = [];
  @Input() datasetOneLabel: string = 'Dataset 1';
  @Input() datasetTwoLabel: string = 'Dataset 2';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    this.createLineChart();
  }

  createLineChart() {
    const datasets: any[] = [
      {
        label: this.datasetOneLabel,
        data: this.datasetOne,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4 // Độ cong của đường (0: không cong, 1: cong hoàn toàn)
      }
    ];

    if (this.datasetTwo.length > 0) {
      datasets.push({
        label: this.datasetTwoLabel,
        data: this.datasetTwo,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4
      });
    }

    const chartData = {
      labels: this.labels,
      datasets: datasets
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
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
              size: 12
            },
            formatter: (value: number) => value.toLocaleString()
          }
        },
        layout: {
          padding: {
            top: 30, // Khoảng cách giữa legend và biểu đồ
            bottom: 10 // Khoảng cách phía dưới biểu đồ
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: ''
            },
            ticks: {
              padding: 10 // Khoảng cách giữa nhãn trục X và biểu đồ
            }
          },
          y: {
            title: {
              display: true,
              text: 'Values'
            },
            beginAtZero: true,
            ticks: {
              padding: 10 // Khoảng cách giữa nhãn trục Y và biểu đồ
            }
          }
        },
        elements: {
          line: {
            borderWidth: 2
          },
          point: {
            radius: 5 // Kích thước điểm trên biểu đồ
          }
        }
      },
      plugins: [DataLabelsPlugin]
    };

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    new Chart(ctx, config);
  }
}
