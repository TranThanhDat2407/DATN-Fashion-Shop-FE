import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto'; // Đảm bảo rằng bạn đã import đúng Chart.js

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements AfterViewInit {
  @Input() lable: string[] = []
  @Input() data: any[] = []


  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  ngAfterViewInit(): void {
    this.createDoughnutChart();
  }

  createDoughnutChart(): void {
    const data = {
      labels: this.lable,
      datasets: [{
        label: 'My First Dataset',
        data: this.data,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgba(255, 205, 86, 0.2)',

        ],
        hoverOffset: 4
      }]
    };

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut', // Chọn kiểu đồ thị là doughnut
      data: data,
    };

    // Khởi tạo chart
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    new Chart(ctx, config); // Tạo biểu đồ
  }
}
