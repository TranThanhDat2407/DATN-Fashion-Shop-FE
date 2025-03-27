import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryTransferResponse } from '../../../../dto/inventory-transfer/InventoryTransferResponse';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryTransferService } from '../../../../services/inventory-transfer/inventory-transfer.service';
import { StoreService } from '../../../../services/client/store/store.service';
import { StoreDetailDTO } from '../../../../dto/StoreDetailDTO';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent],
  templateUrl: './transfer-detail.component.html',
  styleUrl: './transfer-detail.component.scss'
})
export class TransferDetailComponent implements OnInit {

  transfer!: InventoryTransferResponse;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transferService: InventoryTransferService,
    private storeService: StoreService,
    private toastService: ToastrService

  ) { }

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
        this.toastService.success(`Update Pending Successfuly!`, "Success", { timeOut: 5000 });

        this.loadTransfer()

      },
      error: (err) => console.error('Error canceling transfer:', err)
    });
  }

  goBack(): void {
    this.router.navigate([`admin/history_transfer`]);
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
