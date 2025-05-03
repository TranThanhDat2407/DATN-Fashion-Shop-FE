import {Component, OnInit} from '@angular/core';
import {StoreService} from '../../../../services/client/store/store.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {StoreCityRevenueChartComponent} from '../store-city-revenue-chart/store-city-revenue-chart.component';
import {StoreTopRevenueComponent} from '../store-top-revenue/store-top-revenue.component';

@Component({
  selector: 'app-store-statistic-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    MatProgressSpinner,
    NgIf,
    StoreCityRevenueChartComponent,
    StoreTopRevenueComponent
  ],
  templateUrl: './store-statistic-dashboard.component.html',
  styleUrl: './store-statistic-dashboard.component.scss'
})
export class StoreStatisticDashboardComponent implements OnInit {
  cityRevenueData: any[] = [];
  topStoresData: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  selectedYear = new Date().getFullYear(); // Năm mặc định

  constructor(private storeStatsService: StoreService) {}

  ngOnInit() {
    this.loadCityRevenueData();
    this.loadTopStores();
  }

  getYearRange(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({length: 5}, (_, i) => currentYear - i); // 5 năm gần nhất
  }


  loadCityRevenueData() {
    this.isLoading = true;
    this.errorMessage = null;

    this.storeStatsService.getRevenueByCity(this.selectedYear).subscribe({
      next: (data) => {
        this.cityRevenueData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.errorMessage = 'cant load';
        this.isLoading = false;
      }
    });
  }

  loadTopStores(): void {
    this.isLoading = true;
    this.storeStatsService.getTopStoresByRevenue(this.selectedYear).subscribe({
      next: (data) => {
        this.topStoresData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading top stores:', err);
        this.isLoading = false;
      }
    });
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadCityRevenueData();
    this.loadTopStores();
  }
}
