import {Component, OnInit} from '@angular/core';
import {CheckoutService} from '../../../../services/checkout/checkout.service';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';
import {ShippingComponent} from '../shipping/shipping.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    NgIf,
    ShippingComponent,
    RouterLink
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {

  selectedMethod: number = 1; // lấy từ lựa chọn

  constructor(private router: Router, private checkoutService: CheckoutService) {}

  ngOnInit() {

    this.checkoutService.paymentInfo.subscribe(payment => {
      if (payment?.paymentMethodId) {
        this.selectedMethod = payment.paymentMethodId;
      }
    });

  }

  onSelectionChange(method: number) {
    this.selectedMethod = Number(method);
    this.checkoutService.setPaymentInfo({ paymentMethodId: this.selectedMethod });
    console.log("Phương thức thanh toán đã chọn:", this.selectedMethod);
  }







}
