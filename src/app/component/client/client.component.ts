import { Component } from '@angular/core';
import {RouterLink, RouterOutlet, ActivatedRoute} from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { NavBottomComponent } from "./nav-bottom/nav-bottom.component";
import {FooterComponent} from './footer/footer.component';
import {CheckoutComponent} from './checkout/checkout.component';
import {CouponComponent} from './coupon/coupon.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ModalNotifyLoginComponent} from './Modal-notify/modal-notify-login/modal-notify-login.component';
import {ChatbotComponent} from './chatbot/chatbot.component';


@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    HeaderComponent,
    NavBottomComponent,
    FooterComponent,
    TranslateModule,
    ModalNotifyLoginComponent,
    ChatbotComponent
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss'
})
export class ClientComponent {

  constructor(private translate: TranslateService, private route: ActivatedRoute) {
    this.route.params.subscribe((params) => {
      const lang = params['lang'] || 'vi'; // Lấy tham số 'lang' từ URL, mặc định là 'vi'
      this.translate.use(lang); // Thiết lập ngôn ngữ
    });
  }

}
