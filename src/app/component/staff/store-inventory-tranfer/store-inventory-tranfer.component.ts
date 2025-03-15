import {Component, OnInit} from '@angular/core';
import {InventoryTransferResponse} from '../../../dto/inventory-transfer/InventoryTransferResponse';
import {InventoryTransferService} from '../../../services/inventory-transfer/inventory-transfer.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgxBarcode6Module} from 'ngx-barcode6';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {ListStoreStockDTO} from '../../../dto/ListStoreStockDTO';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-store-inventory-tranfer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxBarcode6Module, StoreHeaderComponent, NgOptimizedImage, RouterLink],
  templateUrl: './store-inventory-tranfer.component.html',
  styleUrl: './store-inventory-tranfer.component.scss'
})
export class StoreInventoryTranferComponent implements OnInit {
  transfers: InventoryTransferResponse[] = [];

  selectedStatus: string = '';
  selectedIsReturn: boolean | null = null;
  pageNo = 0;
  pageSize = 10;
  totalPages = 0;


  storeId: number = 0;

  constructor(
    private inventoryTransferService: InventoryTransferService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId'); // Dùng .get() để lấy giá trị
      if (storeIdParam) {
        this.storeId = Number(storeIdParam);
        if (!isNaN(this.storeId)) {
          this.loadTransfers();
        } else {
          console.error('Lỗi: storeId không hợp lệ:', storeIdParam);
        }
      } else {
        console.error('Lỗi: Không tìm thấy storeId trong URL');
      }
    });


  }

  getTotalQuantity(transfer: InventoryTransferResponse): number {
    return transfer.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }


  loadTransfers(): void {
    this.inventoryTransferService
      .getTransfersByStore(
        this.storeId,
        this.selectedStatus || undefined,
        this.selectedIsReturn !== null ? this.selectedIsReturn : undefined,
        this.pageNo,
        this.pageSize
      )
      .subscribe((response) => {
        this.transfers = response.data.content;
        this.totalPages = response.data.totalPages;
      });
  }


  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageNo = page;
      this.loadTransfers();
    }
  }

  applyFilters(): void {
    this.pageNo = 0;
    this.loadTransfers();
  }

  viewDetail(transferId: number): void {
    this.router.navigate([`staff/`,this.storeId,`stock-transfer`, transferId]); // Đảm bảo chuyển hướng đúng
  }


  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedIsReturn = null;
    this.applyFilters();
  }

  isPendingAndOld(transfer: InventoryTransferResponse): boolean {
    if (transfer.status !== 'PENDING' || !transfer.createdAt) return false;

    const createdAt = new Date(transfer.createdAt);
    const now = new Date();
    const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    return diffInDays >= 10;
  }

}
