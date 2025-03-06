import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink,Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NavigationService } from '../../../../services/Navigation/navigation.service';
import {ModalService} from '../../../../services/Modal/modal.service';
import {AuthService} from '../../../../services/Auth/auth.service';
import {AuthGuard} from '../../../../guards/auth.guard';

@Component({
  selector: 'app-modal-notify-login',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './modal-notify-login.component.html',
  styleUrl: './modal-notify-login.component.scss'
})
export class ModalNotifyLoginComponent implements OnInit{
  constructor(
    private router: Router,
    private navigationService : NavigationService,
    private modalService: ModalService,
    private authService: AuthService,
    private authGuard: AuthGuard
  ){
  }
  currentLang: string = '';
  currentCurrency: string = '';
  ngOnInit(): void {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    this.modalService.modalLoginState$.subscribe(state => {
      this.isModalOpen = state;
    });
  }
  @Input() isModalOpen : boolean = false

  onLogin() {
    const loginUrl = [`/client`, this.currentCurrency, this.currentLang, 'login'];
    console.log('🔵 Điều hướng đến:', loginUrl);

    // Điều hướng đến trang login
    this.router.navigate(loginUrl);

    // Đóng modal
    this.modalService.closeLoginModal();
  }


  closeModal() {
    const returnUrl = this.authService.getReturnUrl();
    console.log(returnUrl)
    this.router.navigateByUrl(returnUrl);
    this.modalService.closeLoginModal();
  }
}
