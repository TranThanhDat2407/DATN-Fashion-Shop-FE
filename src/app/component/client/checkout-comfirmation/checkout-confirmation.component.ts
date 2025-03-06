import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-checkout-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './checkout-confirmation.component.html',
  styleUrl: './checkout-confirmation.component.scss'
})
export class CheckoutConfirmationComponent  implements OnInit{
  orderId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || 'Không có mã đơn hàng';
    });
  }

}
