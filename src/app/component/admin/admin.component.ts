import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { HeaderAdminComponent } from './header-admin/header-admin.component';
import { CommonModule, NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MenuComponent, HeaderAdminComponent, NgClass,CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  isMenuActive: boolean = false;
  isLoginAdmin: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Kiểm tra kích thước màn hình ban đầu
    if (typeof window !== 'undefined') {
      this.updateMenuState(window.innerWidth);
    }

    // Kiểm tra URL hiện tại ngay khi component khởi tạo
    this.isLoginAdmin = this.router.url.includes('login_admin');

    // Lắng nghe sự kiện thay đổi route để cập nhật isLoginAdmin
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginAdmin = event.urlAfterRedirects.includes('login_admin');
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
}
