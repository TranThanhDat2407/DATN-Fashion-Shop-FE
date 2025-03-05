import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {NgIf} from '@angular/common';
import {StoreService} from '../../../services/client/store/store.service';
import {UserService} from '../../../services/user/user.service';
import {TokenService} from '../../../services/token/token.service';

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


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('storeId')!;
    console.log('Store ID:', this.storeId);
  }

  logout(): void {
    this.tokenService.removeToken();
    this.router.navigate(['/staff/0/login']);
  }

}
