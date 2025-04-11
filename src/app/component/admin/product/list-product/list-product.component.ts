import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { TableComponent } from "../../table/table.component";
import { ProductServiceService } from '../../../../services/client/ProductService/product-service.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { PageResponse } from '../../../../dto/Response/page-response';
import { ProductListDTO } from '../../../../dto/ProductListDTO';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { ProductVariantDetailDTO } from '../../../../models/ProductVariant/product-variant-detailDTO';

@Component({
  selector: 'app-list-product',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent, TableComponent],
  templateUrl: './list-product.component.html',
  styleUrl: './list-product.component.scss'
})
export class ListProductComponent implements OnInit {
  constructor(
    private productService: ProductServiceService,
    private cdr: ChangeDetectorRef
  ) {

  }
  dataProduct: PageResponse<ProductListDTO[]> | null = null
  dataFullElementProduct: PageResponse<ProductListDTO[]> | null = null;
  header: string[] = ['id', 'name', 'imageUrl', 'isActive', 'colors-product', 'sizes', 'promotions', 'button']
  listTest: ProductListDTO[] = []
  checkedItem: number[] = [];
  isActive: any = null
  name: string = ''
  minPrice?: number
  maxPrice?: number
  page: number = 0
  size: number = 8
  sortBy?: string
  sortDir: 'asc' | 'desc' = 'asc'
  nameSearch: string = ''
  debounceTimerName: any;

  async ngOnInit(): Promise<void> {
    await this.fetchProductList()
  }


  async fetchProductList(): Promise<void> {

    const callApis = {
      dataProduct: this.getProduct('en', this.name, this.isActive, this.minPrice, this.maxPrice, this.page, this.size, this.sortBy, this.sortDir).pipe(catchError(() => of(null)))

    }

    const response = await firstValueFrom(forkJoin(callApis))
    this.dataProduct = response.dataProduct
    this.getFullElementProduct()



  }
  onItemsPerPageChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.fetchProductList();

  }

  getProduct(
    languageCode: string,
    name?: string,
    isActive?: boolean,
    minPrice?: number,
    maxPrice?: number,
    page: number = 0,
    size: number = 0,
    sortBy?: string,
    sortDir: 'asc' | 'desc' = 'asc'): Observable<PageResponse<ProductListDTO[]> | null> {
    return this.productService.getProductsAdmin(languageCode, name, isActive, minPrice, maxPrice, page, size, sortBy, sortDir).pipe(
      map((response: ApiResponse<PageResponse<ProductListDTO[]>>) => response.data || null),
      catchError(() => of(null))
    )
  }

  getDetailProduct(productId: number): Observable<ProductVariantDetailDTO | null> {
    return this.productService.getProductDertail('en', productId).pipe(
      map((response: ApiResponse<ProductVariantDetailDTO>) => response.data || null),
      catchError(() => of(null))
    )
  }

  onIsActiveChange(): void {
    this.fetchProductList()
    console.log("Selected isActive value:", this.isActive);
  }

  onNameChange(value: string): void {
    // Xóa timer cũ nếu có
    if (this.debounceTimerName) {
      clearTimeout(this.debounceTimerName);
    }
    // Đặt timer mới chờ 1s
    this.debounceTimerName = setTimeout(() => {
      this.searchName(value);
    }, 1000);
  }
  searchName(value: string): void {
    this.name = value;

    setTimeout(() => {
      this.onPageChange(0)
    }, 500);

    this.cdr.detectChanges(); // Cập nhật lại giao diện ngay lập tức
  }

  getFullElementProduct(): void {
    if (!this.dataProduct?.content) return; // Kiểm tra nếu dataProduct hoặc content là null

    const productIds = this.dataProduct.content.flat().map(product => product.id);
    const productDetailRequests = productIds.map(id => this.getDetailProduct(id));

    forkJoin(productDetailRequests).subscribe(productDetails => {
      this.dataFullElementProduct = {
        ...this.dataProduct!,
        content: this.dataProduct!.content.map((product, index) => ({
          ...product,
          imageUrl: productDetails[index]?.variantImage || '', // Thêm trường img
        })),
      };

    });
  }

  onCreateAtChange() {
      this.sortBy = this.sortBy
      this.fetchProductList()
  }
  onSortDirChange() {
      this.sortDir = this.sortDir
      this.fetchProductList()
  }

  toggleCheckbox = (item: any): void => {
    item.checked = !item.checked;

    if (item.checked) {
      if (!this.checkedItem.includes(item.id)) {
        this.checkedItem.push(item.id);
      }
    } else {
      this.checkedItem = this.checkedItem.filter(id => id !== item.id);
    }
    console.log('After toggle color:', this.checkedItem);
  }
  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchProductList()
  }

}
