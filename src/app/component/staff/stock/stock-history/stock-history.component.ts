import {Component, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {NgxBarcode6Module} from 'ngx-barcode6';
import {ReactiveFormsModule} from '@angular/forms';
import {StoreHeaderComponent} from '../../store-header/store-header.component';
import {InventoryAudResponse} from '../../../../dto/Response/inventory/InventoryAudResponse';
import {StoreService} from '../../../../services/client/store/store.service';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {PageResponse} from '../../../../dto/Response/page-response';
import {ActivatedRoute, RouterLink} from '@angular/router';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgForOf,
    NgIf,
    NgxBarcode6Module,
    ReactiveFormsModule,
    StoreHeaderComponent,
    NgClass,
    RouterLink
  ],
  templateUrl: './stock-history.component.html',
  styleUrl: './stock-history.component.scss'
})
export class StockHistoryComponent implements OnInit {
  stockHistoryList: InventoryAudResponse[] = [];
  storeId: number = 0;
  pageNo: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  isLoading: boolean = false;

  constructor(private storeService: StoreService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId');
      if (storeIdParam) {
        this.storeId = Number(storeIdParam);
        if (!isNaN(this.storeId)) {
          this.fetchStockHistory();
        } else {
          console.error('Lỗi: storeId không hợp lệ:', storeIdParam);
        }
      } else {
        console.error('Lỗi: Không tìm thấy storeId trong URL');
      }
    });
  }

  fetchStockHistory() {
    if (!this.storeId) return;
    this.isLoading = true;
    this.storeService.getInventoryHistory(this.storeId, this.pageNo, this.pageSize)
      .subscribe({
        next: (response: ApiResponse<PageResponse<InventoryAudResponse>>) => {
          this.stockHistoryList = response.data.content;
          this.totalPages = response.data.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi khi lấy dữ liệu:', error);
          this.isLoading = false;
        }
      });
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageNo = newPage;
      this.fetchStockHistory();
    }
  }
}
