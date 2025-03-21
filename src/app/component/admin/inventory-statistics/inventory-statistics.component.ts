import {Component, OnInit} from '@angular/core';
import {InventoryStatistics, RevenueService} from '../../../services/admin/RevenueService/revenue.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';


@Component({
  selector: 'app-inventory-statistics',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './inventory-statistics.component.html',
  styleUrls: ['./inventory-statistics.component.scss']
})
export class InventoryStatisticsComponent implements OnInit {
  productVariantId!: string;
  products: InventoryStatistics[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 10;
  storeId: number = 2;

  productName: string = '';
  color: string = '';
  sizes: string = '';


  constructor(private revenueService: RevenueService) {
  }

  ngOnInit() {
    this.loadInventory();

  }

  loadInventory() {
    this.revenueService
      .getInventoryStats(this.storeId, this.productName, this.color, this.sizes, this.currentPage, this.pageSize)
      .subscribe(response => {
        if (response.status === 200) {
          this.products = response.data.content;
          this.totalPages = response.data.totalPages;
        }
      });
  }

  applyFilter() {
    this.currentPage = 0;
    this.loadInventory();
  }

  resetFilter() {
    this.productName = '';
    this.color = '';
    this.sizes = '';
    this.applyFilter();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadInventory();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadInventory();
    }
  }

  getImageProduct(imageUrl: string | null): string {
    return imageUrl ? `http://localhost:8080/uploads/images/products/${imageUrl}` : 'assets/images/default-product.png';
  }
}

