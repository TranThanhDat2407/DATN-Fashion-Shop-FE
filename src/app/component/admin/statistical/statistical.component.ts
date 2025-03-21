import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  CountStartAndWishList,
  InventoryStatistics,
  RevenueService
} from '../../../services/admin/RevenueService/revenue.service';
import { debounceTime } from 'rxjs/operators';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-statistical',
  templateUrl: './statistical.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    RouterLink,
    RouterOutlet
  ],
  styleUrls: ['./statistical.component.scss']
})
export class StatisticalComponent implements OnInit {
  products: CountStartAndWishList[] = [];
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  sortColumn: string = ''; // Cột sắp xếp
  sortDirection: 'asc' | 'desc' = 'asc'; // Hướng sắp xếp
  productId?: number;
  searchForm = new FormGroup({
    searchText: new FormControl(''),
    minStars: new FormControl(null)
  });

  constructor(private revenueService: RevenueService,private route: ActivatedRoute) {}

  ngOnInit(): void {

      this.loadProductStats(0);


    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.applyFilter();
    });
  }

  loadProductStats(page: number) {
    const { searchText, minStars } = this.searchForm.value;
    const productName = searchText ? searchText.trim() : undefined;
    const minStarsValue = minStars !== null ? minStars : undefined;

    this.revenueService.getProductStats(
      'vi', this.productId, productName, minStarsValue, this.sortColumn, this.sortDirection, page, this.pageSize
    ).subscribe(response => {
      this.products = response.data?.content || [];
      this.totalPages = response.data?.totalPages || 0;
      this.currentPage = page;
    }, error => console.error('❌ Lỗi khi tải danh sách sản phẩm:', error));
  }



  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.loadProductStats(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.loadProductStats(this.currentPage - 1);
    }
  }

  applyFilter() {
    this.loadProductStats(0);
  }

  resetFilter() {
    this.searchForm.reset();
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.loadProductStats(0);
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadProductStats(0);
  }

  getImageProduct(imageUrl: string | null): string {
    return imageUrl ? `http://localhost:8080/uploads/images/products/${imageUrl}` : 'assets/images/default-product.png';
  }
}


