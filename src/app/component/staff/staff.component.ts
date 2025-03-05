import {Component, HostListener, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {MenuComponent} from '../admin/menu/menu.component';
import {NgIf} from '@angular/common';
import {filter} from 'rxjs/operators';
import {StoreMenuComponent} from './store-menu/store-menu.component';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    RouterOutlet,
    MenuComponent,
    StoreMenuComponent,
    NgIf
  ],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  isMenuActive: boolean = false;
  isLoginPage = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Kiểm tra kích thước màn hình ban đầu
    if (typeof window !== 'undefined') {
      this.updateMenuState(window.innerWidth);
    }

    this.checkLoginPage(this.router.url);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLoginPage(event.urlAfterRedirects);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    this.updateMenuState(width);
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  private updateMenuState(width: number) {
    // Ví dụ: nếu màn hình nhỏ hơn 1208px, có thể thay đổi trạng thái menu
    if (width < 1208) {
      this.isMenuActive = true;
    } else {
      this.isMenuActive = false;
    }
  }

  private checkLoginPage(url: string) {
    // Loại bỏ query string nếu có (vd: /staff/0/login?error=xyz)
    const cleanUrl = url.split('?')[0];

    // Chia URL thành mảng dựa trên dấu '/'
    const urlSegments = cleanUrl.split('/');

    // Kiểm tra nếu đường dẫn là "/staff/0/login"
    this.isLoginPage = urlSegments.length >= 3 && urlSegments[1] === 'staff' && urlSegments[3] === 'login';
  }
}
