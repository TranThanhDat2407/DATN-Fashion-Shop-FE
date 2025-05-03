import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from "../../header-admin/header-admin.component";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {TableComponent} from "../../table/table.component";
import {ProductServiceService} from '../../../../services/client/ProductService/product-service.service';
import {PromotionService} from '../../../../services/promotion/promotion.service';
import {ActivatedRoute, Router} from '@angular/router';
import {PromotionRequest} from '../../../../dto/promotionDTO/PromotionRequest';
import {PageResponse} from '../../../../dto/Response/page-response';
import {ProductListDTO} from '../../../../dto/ProductListDTO';
import {catchError, firstValueFrom, forkJoin, map, Observable, of} from 'rxjs';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {ProductVariantDetailDTO} from '../../../../models/ProductVariant/product-variant-detailDTO';
import {ProductWithImage} from '../../../../dto/ProductWithImage';

@Component({
  selector: 'app-edit-promotion',
  standalone: true,
    imports: [
        HeaderAdminComponent,
        FormsModule,
        NgForOf,
        NgIf,
        TableComponent
    ],
  templateUrl: './edit-promotion.component.html',
  styleUrl: './edit-promotion.component.scss'
})
export class EditPromotionComponent implements OnInit {
  constructor(
    private productService: ProductServiceService,
    private cdr: ChangeDetectorRef,
    private promotionService: PromotionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }
  promotionId!: number;

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
  checkedItem: number[] = [];
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
    // Get the promotionId from route params and fetch related product IDs
    this.route.params.subscribe(async params => {
      this.promotionId = +params['id'];  // Convert the 'id' parameter to a number
      await this.fetchPromotion(this.promotionId);

      await this.fetchProductIds(this.promotionId);  // Wait for product IDs

      // Fetch the product list after fetching product IDs
      await this.fetchProductList();

      // Once product list is fetched, fetch product details with images
      await this.fetchProductsWithImages(this.productIds);


      // Trigger change detection to update the view
      this.cdr.detectChanges();
    });
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
    this.promotionService.removeProductFromPromotion(this.promotionId, id).subscribe(
      (response) => {
        console.log('Product removed from promotion successfully', response);
      },
      (error) => {
        console.error('Error removing product from promotion', error);
      }
    );
  }

  fetchProductIds(promotionId: number): void {
    this.promotionService.getProductIdsByPromotionId(promotionId).subscribe(
      (response) => {
        // Store the product IDs returned from the API
        this.productIds = response.data;
        console.log('Fetched product IDs:', this.productIds);
      },
      (error) => {
        console.error('Error fetching product IDs:', error);
      }
    );
  }

  fetchPromotion(promotionId: number): void {
    this.promotionService.getPromotionById(promotionId).subscribe(
      (response) => {
        // Populate the form fields with the fetched promotion data
        const data = response.data;
        this.promotion.description = data.description;
        this.promotion.discountRate = data.discountRate;
        this.promotion.startDate = data.startDate;
        this.promotion.endDate = data.endDate;

        console.log(response.data);
      },
      (error) => {
        console.error('Error fetching promotion', error);
      }
    );
  }

  // Method to update promotion
  updatePromotion(): void {
    this.promotion.productIds = this.productIds;

    this.promotionService.updatePromotion(this.promotionId, this.promotion).subscribe(
      (response) => {
        console.log('Promotion updated successfully', response);
        this.router.navigate(['/admin/list_promotions']);  // Navigate to the promotion list page
      },
      (error) => {
        console.error('Error updating promotion', error);
        alert('Error updating promotion');
      }
    );
  }
}
