import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-checkout-confirmation',
  standalone: true,
    imports: [
        RouterLink,
        NgIf
    ],
  templateUrl: './checkout-confirmation.component.html',
  styleUrl: './checkout-confirmation.component.scss'
})
export class CheckoutConfirmationComponent  implements OnInit{
  orderId: string = '';
  currentLang: string = '';
  currentCurrency: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private http: HttpClient) {}


  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);

    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || 'Không có mã đơn hàng';
    });
  }

}
