import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavigationService } from '../../../../services/Navigation/navigation.service';
import { firstValueFrom } from 'rxjs';
import { OrderHistoryService } from '../../../../services/client/OrderHistoryService/order-history.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { OrderHistoryDTO } from '../../../../models/OrderHistory/OrderHistory';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../../services/token/token.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../admin/dialog/dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [RouterLink, NgClass, DatePipe, DecimalPipe, NgForOf, NgIf, FormsModule, DialogComponent,CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  currentLang: string = '';
  currentCurrency: string = '';
  orderHistory: OrderHistoryDTO[] = [];
  userId: number = 0; // ID của user
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 5;
  totalElements: number = 0;
  status: string = "";

  constructor(private orderHistoryService: OrderHistoryService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private tokenService: TokenService,
    private diaLog: MatDialog,
    private toastService: ToastrService,


    private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);
    this.userId = this.tokenService.getUserId();
    this.fetchOrderHistory();
  }

  changePendingOrder(orderId: number): void {
    const dialogRef = this.diaLog.open(DialogComponent, {
      data: { message: 'Bạn có muốn hủy không ?',confirm : 'OK' }

    })

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.orderHistoryService.changePendingOrder(orderId).subscribe({
          next: response => {
            this.toastService.success('Success', 'Store Deleted successfully!', { timeOut: 3000 });
            this.fetchOrderHistory()
          },
          error: error => {
            this.toastService.error('Error', 'There was an error deleting the Store.', { timeOut: 3000 });
            console.log(error);
          }
        })
      }
    })
  }


  fetchOrderHistory(): void {
    this.orderHistoryService.getOrderHistory(this.userId, this.currentPage - 1, this.pageSize)
      .subscribe(response => {
        this.orderHistory = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = Math.ceil(response.totalElements / this.pageSize);
      });
  }


  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchOrderHistory();
    }

  }


  clearOrderHistory(): void {
    this.orderHistory = []; // Xóa danh sách đơn hàng hiển thị trên giao diện
  }

  removeOrder(orderId: number, event: Event): void {
    event.stopPropagation(); // Ngăn không cho click vào row bị ảnh hưởng
    this.orderHistory = this.orderHistory.filter(order => order.orderId !== orderId);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'text-warning';
      case 'PROCESSING': return 'text-primary';
      case 'SHIPPED': return 'text-info';
      case 'DELIVERED': return 'text-success';
      case 'CANCELLED': return 'text-danger';
      case 'DONE': return 'text-secondary';
      default: return 'text-muted';
    }
  }
  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'PROCESSING': return 'Đang xử lý';
      case 'SHIPPED': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'CANCELLED': return 'Đã hủy';
      case 'DONE': return 'Hoàn tất';
      default: return 'Không xác định';
    }
  }


  loadOrderHistoryByStatus() {
    let statusFilter = this.status && this.status.trim() !== "" ? this.status : null; // Nếu rỗng thì gửi null để lấy tất cả đơn hàng
    this.orderHistoryService.getOrderHistoryByStatus(this.status, this.currentPage - 1, this.pageSize)
      .subscribe({
        next: (data) => {
          this.orderHistory = data.content;
          this.totalPages = Math.ceil(data.totalElements / this.pageSize);
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch sử đơn hàng:', err);
          this.orderHistory = [];
        }
      });
  }





}
