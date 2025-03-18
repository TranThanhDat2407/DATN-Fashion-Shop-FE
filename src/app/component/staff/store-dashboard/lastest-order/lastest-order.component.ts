import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StoreOrderDetailComponent} from '../../store-order/store-order-detail/store-order-detail.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {StoreOrderDetailResponse} from '../../../../dto/store/StoreOrderDetailResponse';
import {LatestOrderDetailResponse} from '../../../../dto/store/LatestOrderDetailReponse';

@Component({
  selector: 'app-lastest-order',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './lastest-order.component.html',
  styleUrl: './lastest-order.component.scss'
})
export class LastestOrderComponent {
  @Input() orders: LatestOrderDetailResponse[] = [];
  @Input() page: number = 0;
  @Input() totalPages: number = 1;

  @Output() pageChange = new EventEmitter<number>();

  goToPage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.pageChange.emit(pageNumber);
    }
  }
}
