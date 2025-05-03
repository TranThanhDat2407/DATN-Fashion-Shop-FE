import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProductServiceService } from '../../../services/client/ProductService/product-service.service';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { PageResponse } from '../../../dto/Response/page-response';
import { ProductListDTO } from '../../../dto/ProductListDTO';
import {catchError, firstValueFrom, forkJoin, map, Observable, of, Subscription, switchMap} from 'rxjs';
import { ProductVariantDetailDTO } from '../../../models/ProductVariant/product-variant-detailDTO';
import { AsyncPipe, CurrencyPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { ColorDTO } from '../../../models/colorDTO';
import { environment } from '../../../../environments/environment';
import { CurrencyService } from '../../../services/currency/currency-service.service';
import { Currency } from '../../../models/Currency';
import { SizeDTO } from '../../../models/sizeDTO';
import { CategoryParentDTO } from '../../../dto/CategoryParentDTO';
import { ReviewServiceService } from '../../../services/client/ReviewService/review-service.service';
import { ReviewTotalDTO } from '../../../dto/ReviewTotalDTO';
import { ReviewAverageDTO } from '../../../dto/ReviewAverageDTO';
import {TokenService} from '../../../services/token/token.service';
import {WishlistService} from '../../../services/client/wishlist/wishlist.service';
import {NavBottomComponent} from '../nav-bottom/nav-bottom.component';
import {FormsModule} from '@angular/forms';
import {CategoryService} from '../../../services/client/CategoryService/category.service';
import {ProductSuggestDTO} from '../../../dto/ProductSuggestDTO';
import {AuthService} from '../../../services/Auth/auth.service';
import {ModalService} from '../../../services/Modal/modal.service';
import { MatDialog } from '@angular/material/dialog';
import { ModelNotifySuccsessComponent } from '../Modal-notify/model-notify-succsess/model-notify-succsess.component';
import {PromotionResponse} from '../../../dto/PromotionResponse';
import {PromotionService} from '../../../services/promotion/promotion.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, TranslateModule, NgForOf, AsyncPipe, NgIf, CurrencyPipe, DatePipe, NavBottomComponent, FormsModule,ModelNotifySuccsessComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  currentLang: string = ''; // Ngôn ngữ mặc định
  currentCurrency: string ='' ; // Tiền tệ mặc định
  userId: number = 0;

  categoryId ?: number;
  name?: string;
  sortBy: string = 'id';
  sortDir: 'asc' | 'desc' = 'asc';
  categoryName$: Observable<string> = of(''); // Giá trị mặc định

  currentCurrencyDetail?: Currency;
  products: (
    ProductListDTO & {
    detail?: ProductVariantDetailDTO | null,
    colors?: ColorDTO[],
    sizes?: SizeDTO[],
    categoryParent?: CategoryParentDTO[],
    reviewTotal?: number,
    reviewAverage?: number
  })[] = [];

  currentPage: number = 0; // Trang hiện tại
  pageSize: number = 0; // Số sản phẩm trên mỗi trang
  totalPages: number = 0; // Tổng số trang
  totalElements: number = 0; // Tổng số sản phẩm
  first: boolean = true;
  last: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductServiceService,
    private reviewService: ReviewServiceService,
    private navigationService: NavigationService,
    private currencySevice: CurrencyService,
    private tokenService: TokenService,
    private wishlistService: WishlistService,
    private router: Router,
    private categoryService: CategoryService,
    private authService: AuthService,
    private modalService: ModalService,
    private promotionService: PromotionService,
  ) {
    // Subscribe để nhận giá trị từ service
    this.navigationService.setSearchActive(false);
  }

  async ngOnInit(): Promise<void> {
    // Lấy ngôn ngữ hiện tại trước khi gọi API
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await  firstValueFrom(this.navigationService.currentCurrency$);
    this.fetchCurrency()
    this.userId = this.tokenService.getUserId();
    this.wishlistService.getWishlistTotal(this.userId);
    this.fetchActivePromotion();
    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'] ? parseInt(params['categoryId'], 10) : undefined;

      this.currentPage = params['page'] ? parseInt(params['page'], 10) : 0;
      this.pageSize = params['size'] ? parseInt(params['size'], 10) : 10;
      this.sortBy = params['sortBy'] || 'id';
      this.sortDir = params['sortDir'] === 'desc' ? 'desc' : 'asc';
      this.onlyPromotion = !!params['promotionId']; // ✅ Giữ trạng thái lọc theo promotion
      this.name = params['name'] || '';

      if (categoryId !== undefined && this.categoryId !== categoryId) {
        this.categoryId = categoryId;
        this.categoryName$ = this.categoryService.getNameCategory(this.currentLang, categoryId);
      }

      // Nếu có promotionId, lấy dữ liệu theo promotion
      if (this.onlyPromotion) {
        this.fetchProducts(this.categoryId,this.name, true, this.currentPage, this.pageSize, this.sortBy, this.sortDir, parseInt(params['promotionId'], 10));
      } else {
        this.fetchProducts(this.categoryId,this.name, true, this.currentPage, this.pageSize, this.sortBy, this.sortDir);
      }


    });

  }


  fetchProducts(
    categoryId: number | undefined,
    name: string | undefined, // ✅ Thêm name để tìm sản phẩm theo tên
    isActive: boolean,
    page: number,
    size: number,
    sortBy: string,
    sortDir: 'asc' | 'desc',
    promotionId?: number
  ): void {
    console.log('Fetching products with:', { categoryId, name, isActive, page, size, sortBy, sortDir, promotionId });

    this.productService.getProducts(
      this.currentLang,
      categoryId,
      isActive,
      name, // ✅ Truyền name nếu không có categoryId
      undefined, // minPrice (không lọc)
      undefined, // maxPrice (không lọc)
      promotionId,
      page,
      size,
      sortBy,
      sortDir
    ).subscribe(
      (response: ApiResponse<PageResponse<ProductListDTO[]>>) => {
        console.log('API Response:', response);
        if (response.data && Array.isArray(response.data.content)) {
          const productList = response.data.content.flat();
          console.log("Products from API:", productList);

          // Gọi API lấy thông tin chi tiết sản phẩm
          const productRequests = productList.map(product =>
            forkJoin({
              detail: this.getProductDetail(product.id).pipe(catchError(() => of(null))),
              colors: this.getColorNameProduct(product.id).pipe(catchError(() => of([]))),
              sizes: this.getSizeProduct(product.id).pipe(catchError(() => of([]))),
              categoryParent: this.getCategoryParent(this.currentLang, product.id).pipe(catchError(() => of([]))),
              reviewTotal: this.getReviewTotal(product.id).pipe(catchError(() => of(0))),
              reviewAverage: this.getReviewAverage(product.id).pipe(catchError(() => of(0)))
            }).pipe(
              map(({ detail, colors, sizes, categoryParent, reviewTotal, reviewAverage }) =>
                ({ ...product, detail, colors, sizes, categoryParent, reviewTotal, reviewAverage }))
            )
          );

          // Chờ tất cả API hoàn thành và cập nhật danh sách sản phẩm
          forkJoin(productRequests).subscribe(updatedProducts => {
            this.products = updatedProducts;
          });

          // Cập nhật thông tin phân trang
          this.currentPage = response.data.pageNo;
          this.pageSize = response.data.pageSize;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.first = response.data.first;
          this.last = response.data.last;
        }
        this.errorMessage = '';  // Xóa lỗi nếu có trước đó
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.errorMessage = error.message || 'Đã xảy ra lỗi khi tải danh sách sản phẩm.';
      }
    );
  }






  fetchCurrency() {
    this.getCurrency().subscribe(({ data }) => {
      const index = { USD: 0, VND: 1, JPY: 2 }[this.currentCurrency] ?? 0;
      const currency = data?.[index] || { code: '', name: '', symbol: '', exchangeRate: 0 };
      this.currentCurrencyDetail = currency
      console.log('Thông tin tiền tệ:', currency);
    });
  }
  //lấy dữ liệu chi tiết của sản phẩm
  getProductDetail(productId: number): Observable<ProductVariantDetailDTO | null> {
    return this.productService.getProductDertail(this.currentLang, productId, this.userId).pipe(
      map((response: ApiResponse<ProductVariantDetailDTO>) => response.data || null),
      catchError(() => of(null)) // Trả về null nếu có lỗi
    );
  }


  getCurrency(): Observable<ApiResponse<Currency[]>> {
    return this.currencySevice.getCurrency().pipe(
      map((response: ApiResponse<Currency[]>) => {
        // console.log('Dữ liệu tiền tệ lấy thành công:', response );
        return response;
      }),

      catchError(error => {
        console.error('Lỗi khi lấy danh sách tiền tệ:', error);
        return of({
          timestamp: new Date().toISOString(),
          status: 500,
          message: 'Lỗi khi gọi API tiền tệ',
          data: [],
          errors: ['Không thể lấy dữ liệu tiền tệ']
        } as ApiResponse<Currency[]>); // Trả về một ApiResponse<Currency[]> hợp lệ
      })
    );
  }

  getCurrencyPrice(price: number, rate: number, symbol: string): string {
    const convertedPrice = price * rate;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: symbol }).format(convertedPrice);

    // Nếu ký hiệu là USD thì thay thế "US$" bằng "$"
    return symbol === 'USD' ? formattedPrice.replace('US$', '$') : formattedPrice;
  }


  getSizeProduct(productId: number): Observable<SizeDTO[]> {
    return this.productService.getSizeProduct(productId)
      .pipe(
        map((
          response: ApiResponse<SizeDTO[]>) => response.data || []),
        catchError(() => of([]))
      )
  }

  // Lấy đường dẫn hình ảnh từ tên file
  getImageProduct(fileName: string | undefined): string {
    // console.log(this.productService.getImageProduct(fileName))
    return this.productService.getImageProduct(fileName);
  }

  //Lấy danh sách tên màu theo productId
  getColorNameProduct(productId: number): Observable<ColorDTO[]> {
    return this.productService.getColorNameProduct(productId).pipe(
      map((response: ApiResponse<ColorDTO[]>) => response.data || []), // Chỉ lấy `data`
      catchError(() => of([])) // Trả về mảng rỗng nếu lỗi
    );
  }
  // Lấy ảnh màu theo tên màu
  getColorImage(fileName: string | undefined): string {
    return fileName ? `${environment.apiBaseUrl}/attribute_values/color/${fileName}` : 'default-color.jpg';
  }

  getCategoryParent(lang: string, productId: number): Observable<CategoryParentDTO[]> {
    return this.productService.getCategoryParent(lang, productId)
      .pipe(
        map((response: ApiResponse<CategoryParentDTO[]>) => response.data || []),
        catchError(() => of([]))
      )
  }
  getReviewTotal(productId: number): Observable<number> {
    return this.reviewService.getReviewTotal(productId)
      .pipe(
        map(
          (response: ApiResponse<ReviewTotalDTO>) => response.data.totalReviews || 0),
        catchError(() => of(0))
      )

  }

  getReviewAverage(productId: number): Observable<number> {
    return this.reviewService.getReviewAverage(productId)
      .pipe(
        map((response: ApiResponse<ReviewAverageDTO>) => response.data.avgRating || 0),
        catchError(() => of(0))
      )
  }


  toggleWishlist(productId: number, colorId: number): void {
    if (this.userId === 0) {
      // Lưu URL hiện tại để điều hướng lại sau khi đăng nhập
      this.authService.setReturnUrl(this.router.url);

      // Hiển thị modal đăng nhập
      this.modalService.openLoginModal();
      return;
    }

    // ✅ Tìm sản phẩm trong danh sách để cập nhật trạng thái `inWishlist`
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex !== -1 && this.products[productIndex].detail) {
      // ✅ Đảo trạng thái `inWishlist` ngay lập tức để cập nhật UI
      this.products[productIndex].detail!.inWishlist = !this.products[productIndex].detail!.inWishlist;
    }

    // ✅ Gọi API để cập nhật trạng thái wishlist trên backend
    this.wishlistService.toggleWishlistInProductDetail(this.userId, productId, colorId).subscribe({
      next: () => {
        this.wishlistService.getWishlistTotal(this.userId); // Cập nhật tổng số wishlist
      },
      error: (error) => {
        console.error('API Error:', error);
        // ❌ Nếu API lỗi, đảo ngược lại trạng thái
        if (productIndex !== -1 && this.products[productIndex].detail) {
          this.products[productIndex].detail!.inWishlist = !this.products[productIndex].detail!.inWishlist;
        }
      }
    });
  }

  onlyPromotion: boolean = false; // Mặc định hiển thị tất cả

  getFilteredProducts() {
    return this.products.filter(product => {
      const price = product.detail?.salePrice ?? 0;
      const name = product.detail?.name?.toLowerCase() || '';

      // ✅ Lọc theo khoảng giá (nếu có)
      const matchesPrice = !this.selectedPriceRange ||
        (price >= this.selectedPriceRange.min && price <= this.selectedPriceRange.max);

      // ✅ Lọc theo từ khóa tìm kiếm (nếu có)
      const matchesSearch = !this.searchQuery || name.includes(this.searchQuery.toLowerCase());

      // ✅ Lọc theo promotion nếu checkbox được chọn
      const matchesPromotion = !this.onlyPromotion || (product.promotion && product.promotion.id);

      // ✅ Trả về sản phẩm thỏa mãn cả ba điều kiện
      return matchesPrice && matchesSearch && matchesPromotion;
    });
  }



  selectedPriceRange: { min: number, max: number } | null = null;

  onSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.sortProducts(value);
  }

  sortProducts(criteria: string) {
    // if (criteria === 'priceAsc') {
    //   this.sortBy = 'salePrice';
    //   this.sortDir = 'asc';
    // } else if (criteria === 'priceDesc') {
    //   this.sortBy = 'salePrice';
    //   this.sortDir = 'desc';
    if (criteria === 'priceAsc') {
      this.products.sort((a, b) => (a.detail?.salePrice ?? 0) - (b.detail?.salePrice ?? 0));
    } else if (criteria === 'priceDesc') {
      this.products.sort((a, b) => (b.detail?.salePrice ?? 0) - (a.detail?.salePrice ?? 0));

    } else if (criteria === 'createdAtAsc') {
      this.sortBy = 'createdAt';
      this.sortDir = 'asc';
    } else if(criteria === ''){
      this.fetchProducts(
        this.categoryId,
        this.name,
        true,
        this.currentPage,
        this.pageSize,
        this.sortBy,
        this.sortDir,
        this.onlyPromotion ? this.promotion?.id : undefined // ✅ Truyền promotionId nếu có
      );
    }

  }


  onPriceRangeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    if (value === "600000-700000") {
      this.selectedPriceRange = { min: 600000, max: 700000 };
    } else if (value === "700000-800000") {
      this.selectedPriceRange = { min: 700000, max: 800000 };
    } else {
      this.selectedPriceRange = null; // Reset nếu không chọn gì
    }
  }

  //Phân trang

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.router.navigate([], {
        queryParams: {
          categoryId: this.categoryId,
          isActive: true,
          page: newPage,
          size: this.pageSize,
          sortBy: this.sortBy,
          sortDir: this.sortDir,
          promotionId: this.onlyPromotion ? this.promotion?.id : undefined // ✅ Giữ promotionId nếu checkbox được chọn
        },
        queryParamsHandling: 'merge' // ✅ Giữ các query params cũ
      });

      // Gọi lại API với promotionId nếu đang lọc theo promotion
      this.fetchProducts(
        this.categoryId,
        this.name,
        true,
        newPage,
        this.pageSize,
        this.sortBy,
        this.sortDir,
        this.onlyPromotion ? this.promotion?.id : undefined // ✅ Truyền promotionId nếu có
      );
    }
  }



  // Tìm kiếm

  searchQuery: string = '';
  searchResults: (
    ProductListDTO & {
    detail?: ProductVariantDetailDTO | null,
    colors?: ColorDTO[],
    sizes?: SizeDTO[],
    categoryParent?: CategoryParentDTO[],
    reviewTotal?: number,
    reviewAverage?: number

  })[] = []; // Đổi kiểu dữ liệu phù hợp với danh sách sản phẩm hiện tại

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery = inputElement.value.trim().toLowerCase();
  }

  promotion?: PromotionResponse; // Biến lưu trữ khuyến mãi hiện tại


  fetchActivePromotion() {
    this.promotionService.getActivePromotion().subscribe({
      next: (promotion) => {
        this.promotion = promotion;
      },
      error: (error) => {
        console.error('Error fetching active promotion:', error);
        this.promotion = undefined;
      }
    });
  }

  onPromotionFilterChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.onlyPromotion = checkbox.checked; // Cập nhật trạng thái checkbox

    console.log("Chỉ hiển thị sản phẩm có promotion:", this.onlyPromotion);

    // Gọi lại API với promotionId nếu checkbox được chọn
    if (this.onlyPromotion) {
      this.fetchProducts(this.categoryId,this.name, true, this.currentPage, this.pageSize, this.sortBy, this.sortDir, this.promotion?.id);
    } else {
      this.fetchProducts(this.categoryId,this.name, true, this.currentPage, this.pageSize, this.sortBy, this.sortDir);
    }
  }



}
