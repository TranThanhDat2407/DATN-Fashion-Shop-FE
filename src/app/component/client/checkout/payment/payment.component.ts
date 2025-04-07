import {Component, OnInit} from '@angular/core';
import {CheckoutService} from '../../../../services/checkout/checkout.service';
import {Router, RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {ShippingComponent} from '../shipping/shipping.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    NgIf,
    ShippingComponent,
    RouterLink,
    NgForOf
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {


  selectedMethod: number | null = null;
  availablePaymentMethods: { id: number; label: string }[] = [];

  paymentMethods = [
    { id: 1, label: 'Thanh toán khi nhận hàng' },
    { id: 2, label: 'Thanh toán bằng VNPAY' },
    { id: 5, label: 'Thanh toán tại cửa hàng' },
    { id: 6, label: 'Thanh toán bằng Momo' },
    { id: 7, label: 'Thanh toán bằng PayPal' },
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
