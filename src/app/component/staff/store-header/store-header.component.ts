import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {TokenService} from '../../../services/token/token.service';
import {UserService} from '../../../services/user/user.service';
import {UserDetailDTO} from '../../../dto/UserDetailDTO';
import {StoreService} from '../../../services/client/store/store.service';
import {StoreDetailDTO} from '../../../dto/StoreDetailDTO';
import {StaffService} from '../../../services/staff/staff.service';
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {Observable} from 'rxjs';
import {NotificationDTO} from '../../../models/NotificationDTO';
import {NotificationService} from '../../../services/Notification/notification.service';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    NgForOf,
    NgIf,
    TranslatePipe,
    NgClass
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
    private staffService: StaffService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();

    this.route.parent?.paramMap.subscribe(params => {
      this.storeId = params.get('storeId') ?? '0';
      console.log('Store ID trong header:', this.storeId);

      this.checkUserInStore(this.userId, Number(this.storeId));

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


    this.notificationService.getNotifyTotal(this.userId);
    this.totalNotify$ = this.notificationService.totalNotify$;
    this.getNotification(this.userId);
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

  checkUserInStore(userId: number, storeId: number): void {
    this.staffService.checkUserInStore(userId, storeId).subscribe({
      next: (isInStore) => {
        console.log(`🔍 Kiểm tra quyền truy cập store (${storeId}):`, isInStore);
        if (!isInStore) {
          console.warn('🚫 Người dùng không có quyền vào cửa hàng này!');
          this.router.navigate(['/staff/0/login'], {
            queryParams: { error: 'YOU DONT HAVE PERMISSION' }
          });
        }
      },
      error: (err) => {
        console.error('❌ Lỗi khi kiểm tra quyền truy cập store:', err);
        this.router.navigate(['/staff/0/login'], {
          queryParams: { error: 'YOU DONT HAVE PERMISSION' }
        });
      }
    });
  }


  totalNotify$ !: Observable<number>;
  notifications: NotificationDTO[] = [];
  isNotify : boolean = false;
  toggleNotify (): void {
    this.isNotify = !this.isNotify;
  }
  getNotification(userId: number){
    this.notificationService.getUserNotifications(this.userId, 'vi', 0, 5, 'id', 'desc').subscribe(response => {
      this.notifications = response.data.content;
    });
  }
}
