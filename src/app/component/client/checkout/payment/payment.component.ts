import {Component, OnInit} from '@angular/core';
import {CheckoutService} from '../../../../services/checkout/checkout.service';
import {Router, RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {ShippingComponent} from '../shipping/shipping.component';
import {TranslatePipe} from '@ngx-translate/core';
import {translate} from '@angular/localize/tools';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    NgIf,
    ShippingComponent,
    RouterLink,
    NgForOf,
    TranslatePipe
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {


  selectedMethod: number | null = null;
  availablePaymentMethods: { id: number; label: string }[] = [];

  paymentMethods = [
    { id: 1, label: 'payment.cod' }, // 'COD' -> 'payment.cod'
    { id: 2, label: 'payment.vnpay' },
    { id: 5, label: 'payment.in_store'},
    { id: 6, label: 'payment.momo' },
    { id: 7, label: 'payment.paypal' },
  ];


  constructor(private router: Router, private checkoutService: CheckoutService) {}



  ngOnInit() {
    this.checkoutService.paymentInfo.subscribe(payment => {
      this.selectedMethod = payment.paymentMethodId;
      this.updateAvailablePayments();
    });

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




  updateAvailablePayments() {
    const shippingMethodId = this.checkoutService.shippingInfo.value?.shippingMethodId;

    if (shippingMethodId === 1) {
      this.availablePaymentMethods = this.paymentMethods.filter(m => m.id === 1 || m.id === 2 || m.id === 6 || m.id === 7);
    } else {
      this.availablePaymentMethods = this.paymentMethods.filter(m => m.id === 2 || m.id === 5 || m.id === 6 || m.id === 7);
    }

    if (!this.availablePaymentMethods.some(m => m.id === this.selectedMethod)) {
      this.selectedMethod = this.availablePaymentMethods.length > 0 ? this.availablePaymentMethods[0].id : null;
    }
  }


}
