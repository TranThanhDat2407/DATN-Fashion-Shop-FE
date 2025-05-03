import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from "../../header-admin/header-admin.component";
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {TableComponent} from '../../table/table.component';
import {ProductServiceService} from '../../../../services/client/ProductService/product-service.service';
import {PageResponse} from '../../../../dto/Response/page-response';
import {ProductListDTO} from '../../../../dto/ProductListDTO';
import {catchError, firstValueFrom, forkJoin, map, Observable, of} from 'rxjs';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {ProductVariantDetailDTO} from '../../../../models/ProductVariant/product-variant-detailDTO';
import {ProductWithImage} from '../../../../dto/ProductWithImage';
import {PromotionService} from '../../../../services/promotion/promotion.service';
import {PromotionRequest} from '../../../../dto/promotionDTO/PromotionRequest';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-promotion',
  standalone: true,
  imports: [
    HeaderAdminComponent,
    FormsModule,
    NgIf,
    TableComponent,
    NgForOf
  ],
  templateUrl: './create-promotion.component.html',
  styleUrl: './create-promotion.component.scss'
})
export class CreatePromotionComponent implements OnInit {
  constructor(
    private productService: ProductServiceService,
    private cdr: ChangeDetectorRef,
    private promotionService: PromotionService,
    private router: Router
  ) {

  }

  promotion: PromotionRequest = {
    description: '',
    discountRate: 0,
    startDate: '',
    endDate: '',
    productIds: [] // Initialize productIds as an empty array
  };

  dataProduct: PageResponse<ProductListDTO[]> | null = null
  dataFullElementProduct: PageResponse<ProductListDTO[]> | null = null;
  header: string[] = ['id', 'imageUrl', 'name', 'isActive', 'add'];
  isActive: any = null
  name: string = ''
  minPrice?: number
  maxPrice?: number
  page: number = 0
  size: number = 4
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
    return this.productService.getProducts(languageCode, undefined, true, name, minPrice, maxPrice, undefined, page, size, sortBy, sortDir).pipe(
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
  onPageChange(newPage: number): void {
    this.page = newPage;
    this.fetchProductList()
  }


  productIds: number[] = [];

  // Hàm để thêm id vào mảng
  addProduct = (id: number): void => {
    if (!this.productIds.includes(id)) {
      this.productIds.push(id);// Thêm id vào mảng
    }
    this.fetchProductsWithImages(this.productIds);
  }

  productList: ProductWithImage[] = [];

  fetchProductsWithImages(productIds: number[]): void {
    this.productService.getProductsWithImages(productIds).subscribe((products: ProductWithImage[]) => {
      this.productList = products;  // Cập nhật sản phẩm vào mảng productList
    }, error => {
      console.error('Error fetching products with images', error);
    });
  }

  removeProduct(id: number): void {
    // Sử dụng filter để tạo mảng mới không chứa id muốn xóa
    this.productIds = this.productIds.filter(productId => productId !== id);
    this.fetchProductsWithImages(this.productIds);
  }

  createPromotion(): void {
    // Gán giá trị của productIds vào promotion.productIds
    this.promotion.productIds = this.productIds;

    // Gọi API để tạo promotion
    this.promotionService.createPromotion(this.promotion).subscribe(
      (response) => {
        this.router.navigate(['/admin/list_promotion']);
      },
      (error) => {
        console.error('Error creating promotion', error);
      }
    );
  }
}
