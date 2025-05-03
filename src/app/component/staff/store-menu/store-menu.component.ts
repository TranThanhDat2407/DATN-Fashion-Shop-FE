import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {NgIf} from '@angular/common';
import {StoreService} from '../../../services/client/store/store.service';
import {UserService} from '../../../services/user/user.service';
import {TokenService} from '../../../services/token/token.service';
import {UserDetailDTO} from '../../../dto/UserDetailDTO';

@Component({
  selector: 'app-store-menu',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './store-menu.component.html',
  styleUrl: './store-menu.component.scss'
})
export class StoreMenuComponent implements OnInit {
  @Input() isActive: boolean = false;
  storeId!: string;
  currentUser: UserDetailDTO | null = null;
  userRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('storeId')!;
    console.log('Store ID:', this.storeId);
    this.loadCurrentUser();
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/staff/0/login']);
  }

  loadCurrentUser(): void {
    const token = this.tokenService.getToken();
    if (token) {
      this.userService.getUserDetail(token).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.userRole = user.role.name;
          console.log('User role:', this.userRole);
        },
        error: (err) => {
          console.error('Error loading user data:', err);
        }
      });
    }
  }

  hasRequiredRole(requiredRoles: string[]): boolean {
    if (!this.userRole) return false;
    return requiredRoles.includes(this.userRole);
  }

}
