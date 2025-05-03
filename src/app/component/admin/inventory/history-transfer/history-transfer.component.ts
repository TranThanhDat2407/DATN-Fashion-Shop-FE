import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryTransferResponse } from '../../../../dto/inventory-transfer/InventoryTransferResponse';
import { InventoryTransferService } from '../../../../services/inventory-transfer/inventory-transfer.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { Store } from '../../../../models/Store/Store';
import { PageResponse } from '../../../../dto/Response/page-response';
import { firstValueFrom, forkJoin, map, Observable } from 'rxjs';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { StoreService } from '../../../../services/client/store/store.service';

@Component({
  selector: 'app-history-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent,RouterLink],
  templateUrl: './history-transfer.component.html',
  styleUrl: './history-transfer.component.scss'
})
export class HistoryTransferComponent implements OnInit {
  transfers: InventoryTransferResponse[] = [];

  selectedStatus: string = '';
  selectedIsReturn: boolean | null = null;
  pageNo = 0;
  pageSize = 10;
  totalPages = 0;


  name?: string
  city?: string
  page: number = 0
  size: number = 10
  userLat?: number
  userLon?: number
  dataPageStore: PageResponse<Store[]> | null = null
  dataStore: Store[] = []
  totalPageStore = 0;


  storeId: number = 0;

  constructor(
    private inventoryTransferService: InventoryTransferService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private storeService: StoreService,

  ) { }

  ngOnInit(): void {

    this.loadTransfers();
    this.loadStore();

  }
 
  
  loadStore(): void {
    this.storeService
      .getStore(
        this.name, this.city, this.page, this.size, this.userLat, this.userLon
      )
      .subscribe((response) => {

        this.dataStore = response.data.content.flat() ?? [];
        this.totalPageStore = response.data.totalPages;
      });
  }



  getStore(
    name?: string,
    city?: string,
    page: number = 0,
    size: number = 10,
    userLat?: number,
    userLon?: number): Observable<PageResponse<Store[]>> {
    return this.storeService.getStore(name, city, page, size, userLat, userLon).pipe(
      map((response: ApiResponse<PageResponse<Store[]>>) => response.data || null)
    )
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
    this.router.navigate([`admin/`, `transfer_detail`, transferId]); // Đảm bảo chuyển hướng đúng
  }


  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedIsReturn = null;
    this.storeId = 0
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
