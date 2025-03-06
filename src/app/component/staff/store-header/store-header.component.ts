import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {TokenService} from '../../../services/token/token.service';
import {UserService} from '../../../services/user/user.service';
import {UserDetailDTO} from '../../../dto/UserDetailDTO';
import {StoreService} from '../../../services/client/store/store.service';
import {StoreDetailDTO} from '../../../dto/StoreDetailDTO';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './store-header.component.html',
  styleUrl: './store-header.component.scss'
})
export class StoreHeaderComponent implements OnInit {
  @Input() title_header: string = 'Trống ';
  @Input() title_btn : string = 'Add Item';
  @Input() routerLinkString : string = ''

  userId: number = 0;
  store: StoreDetailDTO | null = null;
  storeId?: string;
  userDetail!: UserDetailDTO;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private userService: UserService,
    private storeService: StoreService,
  ) { }

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();

    this.route.parent?.paramMap.subscribe(params => {
      this.storeId = params.get('storeId') ?? '0';
      console.log('Store ID trong header:', this.storeId);
    });

    this.getStoreDetail(Number(this.storeId));

    const token = this.tokenService.getToken(); // Lấy token từ TokenService

    if (token) {
      this.userService.getUserDetail(token).subscribe({
        next: (data) => {
          this.userDetail = data; // Lưu thông tin người dùng vào biến
        },
        error: (err) => {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
        }
      });
    }
  }

  getStoreDetail(storeId: number): void {
    this.storeService.getStoreDetail(storeId).subscribe(
      (response) => {
        if (response?.data) {
          this.store = response.data;
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu cửa hàng:', error);
      }
    );
  }



}
