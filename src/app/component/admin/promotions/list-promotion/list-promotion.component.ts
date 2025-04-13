import {Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from "../../header-admin/header-admin.component";
import {TableComponent} from '../../table/table.component';
import {PageResponse} from '../../../../dto/Response/page-response';
import {PromotionSimpleResponse} from '../../../../dto/promotionDTO/PromotionSimpleResponse';
import {PromotionService} from '../../../../services/promotion/promotion.service';
import {NgIf} from '@angular/common';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';

@Component({
  selector: 'app-list-promotion',
  standalone: true,
  imports: [
    HeaderAdminComponent,
    TableComponent,
    NgIf,
  ],
  templateUrl: './list-promotion.component.html',
  styleUrl: './list-promotion.component.scss'
})
export class ListPromotionComponent implements OnInit{
  header: string[] = ['id', 'description', 'discountRate', 'startDate', 'endDate', 'isActive', 'button']
  page: number = 0
  size: number = 4; // Giá trị mặc định cho page size
  sortBy: string = 'id';  // Giá trị mặc định cho sortBy
  sortDir: string = 'desc';  // Giá trị mặc định cho sortDir
  dataFullElementProduct: PageResponse<PromotionSimpleResponse[]> | null = null;
  constructor(private promotionService: PromotionService,
              ) {}

  ngOnInit() {
    this.fetchPromotionList();  // Lấy danh sách promotion khi component khởi tạo
  }

  // Hàm gọi API để lấy danh sách promotions
  fetchPromotionList() {
    this.promotionService.getAllPromotions(this.page, this.size, this.sortBy, this.sortDir)
      .subscribe(response => {
        // Cập nhật dữ liệu phân trang
        this.dataFullElementProduct = response.data;

      }, error => {
        console.error('Error fetching promotion list', error);
      });
  }
  onItemsPerPageChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.fetchPromotionList();

  }
  // Hàm thay đổi trang
  onPageChange(newPage: number) {
    this.page = newPage;
    this.fetchPromotionList();  // Gọi lại API khi thay đổi trang
  }

  removePromotion=(id:number) : void =>{
    // Gọi API delete
    this.promotionService.deletePromotion(id)
      .subscribe({
        next: (response: ApiResponse<string>) => {
          console.log('Promotion deleted successfully', response);
        },
        error: (error) => {
          console.error('Error deleting promotion', error);
        }
      });
  }

}
