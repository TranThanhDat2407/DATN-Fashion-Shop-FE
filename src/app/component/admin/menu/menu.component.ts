import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {Router} from '@angular/router';
import {TokenService} from '../../../services/token/token.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  constructor(
    private router: Router,
    private tokenService: TokenService,
  ) {
  }
  @Input() isActive: boolean = false;

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate([`/admin/login_admin`]);
  }
}
