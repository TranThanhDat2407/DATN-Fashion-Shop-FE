import {Component, OnInit} from '@angular/core';
import {OrderDetail} from '../../../../models/OrderDetail/OrderDetail';
import {ActivatedRoute} from '@angular/router';
import {OrderDetailService} from '../../../../services/client/OrderDetailService/order-detail.service';
import {NavigationService} from '../../../../services/Navigation/navigation.service';
import {firstValueFrom} from 'rxjs';
import {DatePipe, DecimalPipe, NgForOf, NgOptimizedImage} from '@angular/common';
import {ProductVariantDetailDTO} from '../../../../models/ProductVariant/product-variant-detailDTO';
import {ProductVariant} from '../../../../models/ProductVariant/ProductVariant';


@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    NgForOf,
    DecimalPipe,
    NgOptimizedImage,
    DatePipe
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  currentLang: string = '';
  currentCurrency: string = '';
  orderId!: number;
  orderDetails: OrderDetail[] = [];
  order: OrderDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderDetailService: OrderDetailService,
    private navigationService: NavigationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);

    this.route.paramMap.subscribe(params => {
      this.orderId = Number(params.get('id'));
      console.log("Order ID:", this.orderId);
      if (this.orderId) {
        this.fetchOrderDetails();
      }
    });
  }

  fetchOrderDetails(): void {
    this.orderDetailService.getOrderDetails(this.orderId).subscribe(
      response => {

        if (response.status === 200 && response.data.length > 0) {
          this.orderDetails = response.data;
          this.order = this.orderDetails[0];

          console.log("API Response:", response);
          console.log("Product Variant:", this.orderDetails[0]?.productVariant);


        } else {
          console.warn("Không có dữ liệu đơn hàng.");
        }
      },
      error => {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      }
    );
  }
  getImageProduct(imageUrl: string | null): string {
    return `http://localhost:8080/uploads/images/products/${imageUrl}`;
  }


}
