import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ProductServiceService } from '../../../services/client/ProductService/product-service.service';
import { SizeDTO } from '../../../models/sizeDTO';
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { ColorDTO } from '../../../models/colorDTO';
import { DetailProductDTO } from '../../../dto/DetailProductDTO';
import { DetailProductService } from '../../../services/client/DetailProductService/detail-product-service.service';
import { Promotion } from '../../../models/Product/Promotion';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  constructor(
    private productService: ProductServiceService,
    private detailProductService: DetailProductService,
  ) {
  }
  Math = Math;
  @Input() tableHeaders: string[] = [];
  @Input() tableData: any[] = [];
  @Input() eventClickDelete: (item: any) => void = () => {
  };
  @Input() routerLinkString: string = '';
  @Input() eventClickAdd: (item: any) => void = () => {
  };

  @Input() activeRouterLinkString: string = '';
  @Input() changePage: boolean = true;
  @Input() toggleCheckbox: (item: any) => void = () => {
  };
  @Input() changeActive: (item: boolean) => void = () => {
  };
  @Input() typeImage: string = '';
  @Input() routerLinkStringView: string = '/admin/order_detail';

  @Input() dataPage: any = {}; // Dữ liệu bảng
  @Input() itemsPerPage: number = 10; // Số mục hiển thị mỗi trang
  @Input() currentPage: number = 0; // Trang hiện tại
  @Output() pageChanged = new EventEmitter<number>();
  @Output() itemsPerPageChanged = new EventEmitter<number>();


  onItemsPerPageChange(event: Event) {
    const newSize = +(event.target as HTMLSelectElement).value;
    this.itemsPerPageChanged.emit(newSize);
    const checkColor = this.tableHeaders.some(color => color === 'colors-product')
    if (checkColor) {
      setTimeout(() => {
        this.loadAllColors()
      }, 2000)
    } else {
      console.log("ko chay load color")
    }
  }



  page: number = 0
  sizeMap = new Map<number, string>();


  async ngOnInit(): Promise<void> {
    this.loadAllColors();
  }


  promotionMap = new Map<number, Observable<DetailProductDTO | null>>();

  dataPromotion(productId: number): Observable<DetailProductDTO | null> {
    if (!productId) return of(null);

    if (!this.promotionMap.has(productId)) {
      this.promotionMap.set(productId, this.getDetailsProduct('en', productId));
    }

    return this.promotionMap.get(productId)!;
  }


  dataSizes(productId: number): string {
    if (!productId) return '';

    if (this.sizeMap.has(productId)) {
      return this.sizeMap.get(productId) || '';
    }

    this.getSizeProduct(productId).subscribe(sizes => {
      const sizeNames = sizes.map(size => size.valueName).join(' , ');
      this.sizeMap.set(productId, sizeNames);
    });

    return '';
  }


  getDetailsProduct(lang: string, productId: number): Observable<DetailProductDTO | null> {
    return this.detailProductService.getDetailProduct(lang, productId).pipe(
      map((response: ApiResponse<DetailProductDTO>) => response?.data ?? null),
      catchError((error) => {
        console.error("❌ Lỗi khi gọi API getDetailsProduct:", error);
        return of(null);
      })
    );

  }


  getSizeProduct(productId: number): Observable<SizeDTO[]> {
    return this.productService.getSizeProduct(productId).pipe(
      map((response: ApiResponse<SizeDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  getColors(productId: number): Observable<ColorDTO[]> {
    return this.productService.getColorNameProduct(productId).pipe(
      map((response: ApiResponse<ColorDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  colorMap: Map<number, string[]> = new Map(); // Lưu danh sách ảnh theo productId

  async loadAllColors() {
    if (!this.tableData || this.tableData.length === 0) return; // Tránh lỗi nếu không có dữ liệu

    for (const item of this.tableData) {
      const colors = await this.dataColor(item.id);
      this.colorMap.set(item.id, colors);
    }
  }

  async dataColor(productId: number): Promise<string[]> {
    if (!productId) return [];

    // Nếu đã có dữ liệu, trả về ngay thay vì gọi API lại
    if (this.colorMap.has(productId)) {
      return this.colorMap.get(productId) ?? [];
    }

    try {
      const colors = await lastValueFrom(this.getColors(productId));
      const valueImgs: string[] = colors.map(color => color.valueImg).filter(img => img);

      return valueImgs;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu màu:', error);
      return [];
    }
  }
  // colors-product


  setPage(page: number) {
    this.currentPage = page;
    this.page = page

    const checkColor = this.tableHeaders.some(color => color === 'colors-product')
    if (checkColor) {
      setTimeout(() => {
        this.loadAllColors()
      }, 1000)
    } else {
      console.log("ko chay load color")
    }

    this.pageChanged.emit(page);  // Phát sự kiện
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const maxDisplay = 5;
    const half = Math.floor(maxDisplay / 2);

    let start = Math.max(this.currentPage - half, 0);
    let end = start + maxDisplay;

    if (end > total) {
      end = total;
      start = Math.max(0, end - maxDisplay);
    }

    const pages: number[] = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  }






  get totalPages() {
    return this.dataPage?.totalPages ? Math.ceil(this.dataPage.totalPages) : 0;
  }


}
