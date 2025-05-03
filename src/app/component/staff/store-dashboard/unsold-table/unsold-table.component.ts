import {Component, EventEmitter, Input, Output} from '@angular/core';
import {InventoryService, InventoryStatusResponse} from '../../../../services/admin/InventoryService/inventory.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-unsold-table',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './unsold-table.component.html',
  styleUrl: './unsold-table.component.scss'
})
export class UnsoldTableComponent {
  @Input() page: number = 0;
  @Input() totalPages: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  // Các Input khác nếu cần
  @Input() unsoldProducts: any[] = []; // Hoặc sử dụng interface cụ thể

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }
}
