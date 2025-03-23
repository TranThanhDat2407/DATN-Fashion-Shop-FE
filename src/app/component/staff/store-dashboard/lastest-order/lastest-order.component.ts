import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StoreOrderDetailComponent} from '../../store-order/store-order-detail/store-order-detail.component';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {StoreOrderDetailResponse} from '../../../../dto/store/StoreOrderDetailResponse';
import {LatestOrderDetailResponse} from '../../../../dto/store/LatestOrderDetailReponse';
import {OrderService} from '../../../../services/order/order.service';
import {ActivatedRoute, Router} from '@angular/router';

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
  storeId: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  constructor( private router: Router,   private route: ActivatedRoute,
  ) {
    this.route.parent?.paramMap.subscribe(params => {
      this.storeId = Number(params.get('storeId')) ?? '0';
    });
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      this.pageChange.emit(pageNumber);
    }
  }

  viewDetail(orderId: number): void {
    this.router.navigate([`/staff/${this.storeId}/store-order/${orderId}`]);
  }
}
