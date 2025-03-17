import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';

export interface TopProduct {
  productVariantId: number;
  productName: string;
  color: string;
  colorImage: string;
  size: string;
  imageUrl: string;
  totalSold: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-top-products-table',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule,
  ],
  templateUrl: './top-products-table.component.html',
  styleUrl: './top-products-table.component.scss'
})
export class TopProductsTableComponent {
  @Input() products: TopProduct[] = [];
  @Input() page: number = 0;
  @Input() totalPages: number = 1;

  @Output() pageChange = new EventEmitter<number>();

  goToPage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.pageChange.emit(pageNumber);
    }
  }
}
