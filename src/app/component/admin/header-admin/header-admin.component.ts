import {Component, Input, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TokenService} from '../../../services/token/token.service';
import {UserService} from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss'
})
export class HeaderAdminComponent implements OnInit {
  @Input() title_header: string = 'Trống ';
  @Input() title_btn : string = 'Add Item';
  @Input() routerLinkString : string = ''
  @Input() btnActive : boolean = true

  userId: number = 0;
  userDetail: any;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();
    const token = this.tokenService.getToken(); // Lấy token từ TokenService

    if (token) {
      this.userService.getUserDetail(token).subscribe({
        next: (response) => {
          this.userDetail = response; // Lưu thông tin người dùng vào biến
        },
        error: (err) => {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
        }
      });
    }
  }


}
