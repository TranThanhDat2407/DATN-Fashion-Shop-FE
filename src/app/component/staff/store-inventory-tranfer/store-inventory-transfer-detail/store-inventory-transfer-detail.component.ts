import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InventoryTransferResponse} from '../../../../dto/inventory-transfer/InventoryTransferResponse';
import {ActivatedRoute, Router} from '@angular/router';
import {InventoryTransferService} from '../../../../services/inventory-transfer/inventory-transfer.service';
import {StoreHeaderComponent} from '../../store-header/store-header.component';
import {StoreService} from '../../../../services/client/store/store.service';
import {StoreDetailDTO} from '../../../../dto/StoreDetailDTO';

@Component({
  selector: 'app-store-inventory-transfer-detail',
  standalone: true,
  imports: [CommonModule, StoreHeaderComponent],
  templateUrl: './store-inventory-transfer-detail.component.html',
  styleUrl: './store-inventory-transfer-detail.component.scss'
})
export class StoreInventoryTransferDetailComponent implements OnInit {

  transfer!: InventoryTransferResponse;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transferService: InventoryTransferService,
    private storeService: StoreService,
  ) {}

  ngOnInit(): void {
    this.loadTransfer();

  }

  loadTransfer(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.transferService.getTransferById(+id).subscribe({
        next: (data) => {
          console.log('Transfer Data:', data);  // Log dữ liệu
          this.transfer = data;
          this.getStoreDetail(Number(this.transfer.storeId));
        },
        error: (err) => console.error('Error fetching transfer details:', err)
      });
    }
  }

  confirmTransfer(): void {
    if (!this.transfer) return;

    this.transferService.confirmTransfer(this.transfer.id).subscribe({
      next: (updatedTransfer) => {
        this.transfer = updatedTransfer;
        this.loadTransfer()
      },
      error: (err) => console.error('Error confirming transfer:', err)
    });
  }

  cancelTransfer(): void {
    if (!this.transfer) return;

    this.transferService.cancelTransfer(this.transfer.id).subscribe({
      next: (updatedTransfer) => {
        this.transfer = updatedTransfer;
        this.loadTransfer()
      },
      error: (err) => console.error('Error canceling transfer:', err)
    });
  }

  goBack(): void {
    this.router.navigate([`staff/`,this.transfer.storeId,`stock-transfer`]);
  }

  store: StoreDetailDTO | null = null;
  getStoreDetail(storeId: number): void {
    this.storeService.getStoreDetail(storeId).subscribe(
      (response) => {
        if (response?.data) {
          this.store = response.data;
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu cửa hàng:', error);
      }
    );
  }
}
