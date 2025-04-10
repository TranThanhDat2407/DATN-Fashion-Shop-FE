import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import { TranslateModule } from '@ngx-translate/core';
import { NavBottomComponent } from '../nav-bottom/nav-bottom.component';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, take, tap } from 'rxjs';
import { ProductServiceService } from '../../../services/client/ProductService/product-service.service';
import { DetailProductService } from '../../../services/client/DetailProductService/detail-product-service.service';
import { ImagesDetailProductDTO } from '../../../dto/ImagesDetailProductDTO';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { SizeDTO } from '../../../models/sizeDTO';
import { VariantsDetailProductDTO } from '../../../dto/VariantsDetailProductDTO';
import { Location } from '@angular/common';
import { ColorDTO } from '../../../models/colorDTO';
import { CategoryParentDTO } from '../../../dto/CategoryParentDTO';
import { response } from 'express';
import { DetailProductDTO } from '../../../dto/DetailProductDTO';
import { InventoryDTO } from '../../../dto/InventoryDTO';
import { ReviewServiceService } from '../../../services/client/ReviewService/review-service.service';
import { ReviewTotalDTO } from '../../../dto/ReviewTotalDTO';
import { ReviewAverageDTO } from '../../../dto/ReviewAverageDTO';
import { Currency } from '../../../models/Currency';
import { CurrencyService } from '../../../services/currency/currency-service.service';
import { ReviewDetailProductDTO } from '../../../dto/ReviewDetailProductDTO';
import { PageResponse } from '../../../dto/Response/page-response';
import { WishlistService } from '../../../services/client/wishlist/wishlist.service';
import { TokenService } from '../../../services/token/token.service';
import { CartService } from '../../../services/client/CartService/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { CreateCartDTO } from '../../../dto/CreateCartDTO';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, NgModel } from '@angular/forms';
import { ModelNotifySuccsessComponent } from '../Modal-notify/model-notify-succsess/model-notify-succsess.component';
import { ModalNotifyErrorComponent } from '../Modal-notify/modal-notify-error/modal-notify-error.component';
import { SessionService } from '../../../services/session/session.service';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavBottomComponent, ModalNotifyErrorComponent, NgClass,
    FormsModule, ModelNotifySuccsessComponent
  ],
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.scss'
})
export class DetailProductComponent implements OnInit {
  productId?: number;
  colorId?: number;
  sizeId?: number;
  selectedSizeId!: number;
  selectedColorId!: number;
  currentLang: string = '';
  currentCurrency: string = '';
  currentCurrencyDetail?: Currency;
  qtyCart: number = 1

  userId: number = 0;

  colorImage: any;
  noColorImages: any[] = [];
  dataImagesProduct: ImagesDetailProductDTO[] = [];
  dataVideoProduct: ImagesDetailProductDTO[] = []
  dataReviewDetailProduct: ReviewDetailProductDTO[] = []
  dataSizes: SizeDTO[] = [];
  dataColors: ColorDTO[] = [];
  dataCategoryParent: CategoryParentDTO[] = [];
  dataDetailsProduct: DetailProductDTO | null = null;
  dataQuantityInStock: InventoryDTO[] = []
  reviewAverage: number = 0
  reviewTotal: number = 0
  salePrice: number = 0;
  dataVariants: VariantsDetailProductDTO | null = null
  variantId?: number = 0
  quantityInStock?: InventoryDTO | null = null;
  notifyError: boolean = false
  notifySuccsess: boolean = false

  page: number = 0
  size: number = 3
  sortBy: string = 'id'
  sortDir: string = 'desc'

  isWishlist: boolean = false;
  sessionId?: string;
  cart: CreateCartDTO = { productVariantId: 0, quantity: 0 };

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private routerActi: ActivatedRoute,
    private productService: ProductServiceService,
    private detailProductService: DetailProductService,
    private location: Location,
    private reviewService: ReviewServiceService,
    private currencySevice: CurrencyService,
    private cdr: ChangeDetectorRef,
    private wishlistService: WishlistService,
    private tokenService: TokenService,
    private cartService: CartService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private sessionService: SessionService

  ) {
    this.sessionId = this.cookieService.get('SESSION_ID') || '';

  }

  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);
    this.getIdsFromProductRouter();
    this.fetchCurrency();
    this.userId = this.tokenService.getUserId() ?? 0;
    this.sessionId = this.sessionService.getSession() ?? ''

    // this.cartService.getQtyCart(this.userId,this.sessionId);
    this.routerActi.params.subscribe(params => {
      this.productId = Number(params['productId']) || 0;
      this.colorId = Number(params['colorId']) || 0;
      this.sizeId = Number(params['sizeId']) || 0;
      console.log(this.productId)
      console.log(this.colorId)
      console.log(this.sizeId)
      this.isValidToAddCart()

      this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
        this.variantId = price?.id;
        console.log('variantId : ' + this.variantId)

      });



      this.fetchDetailProduct(this.productId ?? 0).then(() => {
        this.selectedSizeId = this.sizeId ?? 0; // Đánh dấu size được chọn
        this.selectedColorId = this.colorId ?? 0; // Đánh dấu size được chọn
      });


      this.updateUrl(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0);
      // this.changeImageOne(this.productId ?? 0,this.colorId ?? 0);
      this.userId = this.tokenService.getUserId();
      this.checkWishlist(this.userId, this.productId ?? 0, this.colorId ?? 0);

    });
  }



  async fetchDetailProduct(productId: number): Promise<void> {
    if (!productId) return;

    const response = await firstValueFrom(
      forkJoin({
        allImagesProduct: this.getAllImagesProduct(productId).pipe(catchError(() => of([]))),
        dataSizes: this.getSizeProduct(productId).pipe(catchError(() => of([]))),
        salePrice: this.getSalePrice(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).pipe(catchError(() => of(0))),
        dataVariants: this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).pipe(catchError(() => of(null))),
        dataColors: this.getColorNameProduct(productId).pipe(catchError(() => of([]))),
        dataCategoryParent: this.getCategoryParent(this.currentLang, productId).pipe(catchError(() => of([]))),
        dataDetailsProduct: this.getDetailsProduct(this.currentLang, productId).pipe(catchError(() => of(null))),
        dataQuantityInStock: this.getQuantityInStock(productId, this.colorId ?? 0).pipe(catchError(() => of([]))),
        reviewTotal: this.getReviewTotal(productId).pipe(catchError(() => of(0))),
        reviewAverage: this.getReviewAverage(productId).pipe(catchError(() => of(0))),
        quantityInStock: this.getStatusQuantityInStock(productId, this.colorId ?? 0, this.sizeId ?? 0).pipe(catchError(() => of(null))),
        dataVideoProduct: this.getVideosProduct(productId).pipe(catchError(() => of([]))),
        dataReviewDetailProduct: this.getReviewDetailProduct(productId, this.page, this.size, this.sortBy, this.sortDir).pipe(catchError(() => of([])))
      })
    );

    this.dataImagesProduct = response.allImagesProduct;
    this.dataSizes = response.dataSizes;
    this.salePrice = response.salePrice;
    this.dataVariants = response.dataVariants
    this.dataColors = response.dataColors;
    this.dataCategoryParent = response.dataCategoryParent;
    this.reviewAverage = response.reviewAverage;
    this.reviewTotal = response.reviewTotal;
    this.dataDetailsProduct = response.dataDetailsProduct
    this.dataQuantityInStock = response.dataQuantityInStock
    this.quantityInStock = response.quantityInStock
    this.dataVideoProduct = response.dataVideoProduct
    this.dataReviewDetailProduct = response.dataReviewDetailProduct
    if (this.dataImagesProduct?.length) {
      this.colorImage = this.dataImagesProduct.find(img => img.colorId);

      const groupedImages = this.dataImagesProduct.reduce((acc, img) => {
        if (!acc[img.colorId]) {
          acc[img.colorId] = [];
        }
        acc[img.colorId].push(img);
        return acc;
      }, {} as Record<string, typeof this.dataImagesProduct>);

      this.noColorImages = Object.values(groupedImages).flatMap(group => group.slice(1));
    }




    this.changeImageOne(this.productId ?? 0, this.colorId ?? 0).subscribe(images => {
      if (images) {
        this.dataImagesProduct[0].mediaUrl = images[0].mediaUrl; // Cập nhật danh sách ảnh
        this.cdr.detectChanges();
      }
    });

    if (this.colorId === 0 && this.dataColors.length > 0) {
      this.colorId = this.dataColors[0].id;
    }

    if (this.sizeId === 0 && this.dataSizes.length > 0) {
      this.sizeId = this.dataSizes[0].id;
    }

    this.getQuantityInStock(this.productId ?? 0, this.colorId ?? 0).subscribe(colorList => {
      this.dataQuantityInStock = colorList
    })
    this.getStatusQuantityInStock(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(qty => {
      this.quantityInStock = qty;
      this.cdr.detectChanges(); // Cập nhật giao diện ngay khi có dữ liệu mới
    });

    this.getSalePrice(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
      this.salePrice = price;
      this.cdr.detectChanges();
    });

    this.changeImageOne(this.productId ?? 0, this.colorId ?? 0).subscribe(images => {
      if (images) {
        this.dataImagesProduct[0].mediaUrl = images[0].mediaUrl; // Cập nhật danh sách ảnh
        this.mediaId = images[0].id
        this.checkMedia = images[0].hasVariants


        this.cdr.detectChanges();
      }
    });


    this.updateUrl(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0);

  }

  isValidToAddCart(): boolean {
    // Kiểm tra nếu số lượng giỏ hàng <= 0
    if (this.qtyCart <= 0) {
      this.notifyError = false;
      setTimeout(() => {
        this.notifyError = true;
      }, 10);
      return false;
    }
    return true;
  }

  createCart() {

    this.getStatusQuantityInStock(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(item => {

      if (item?.quantityInStock === undefined || item?.quantityInStock === 0 || item?.quantityInStock < this.qtyCart) {
        this.notifyError = false;
        setTimeout(() => {
          this.notifyError = true;
        }, 10);
        return;
      }


      const qty = Number(this.qtyCart);
      this.cart = { productVariantId: this.variantId ?? 0, quantity: qty };

      if (this.isValidToAddCart()) {
        if (this.cart.productVariantId !== 0 && this.cart.quantity !== 0) {
          this.cartService.createCart(this.userId, this.sessionId ?? '', this.cart).subscribe((response) => {

            this.notifySuccsess = false;
            setTimeout(() => {
              this.notifySuccsess = true;
            }, 10);

            const sessionId = this.sessionService.getSession();
            this.cartService.getQtyCart(this.userId, sessionId ?? '');
          });
        }
      }
    });
  }

  totalCart$!: Observable<number>;



  onInput(event: any): void {
    // Lọc chỉ cho phép nhập số
    const inputValue = event.target.value;

    // Chỉ giữ lại số, bỏ qua chữ và ký tự đặc biệt
    const numericValue = inputValue.replace(/[^0-9]/g, '');

    // Cập nhật lại giá trị qtyCart chỉ với các chữ số
    this.qtyCart = numericValue ? parseInt(numericValue, 10) : 0;

    // Cập nhật lại giá trị input field
    event.target.value = this.qtyCart;
  }
  getIdsFromProductRouter(): void {
    this.routerActi.params.pipe(take(1)).subscribe(params => {
      this.productId = Number(params['productId']) || 0;
      this.colorId = Number(params['colorId']) || 0;
      this.sizeId = Number(params['sizeId']) || 0;
    });
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
  getQuantityInStock(productId: number, colorId: number): Observable<InventoryDTO[]> {
    return this.productService.getQuantityInStock(productId, colorId).pipe(
      map((response: ApiResponse<InventoryDTO[]>) => response.data || []),
      catchError(() => of([]))
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

  getAllImagesProduct(productId: number): Observable<ImagesDetailProductDTO[]> {
    return this.productService.getAllImageProduct(productId).pipe(
      map((response: ApiResponse<ImagesDetailProductDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }
  getVideosProduct(productId: number): Observable<ImagesDetailProductDTO[]> {
    return this.productService.getVideosProduct(productId).pipe(
      map((response: ApiResponse<ImagesDetailProductDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }
  getCurrencyPrice(price: number, rate: number, code: string): string {
    try {
      const validCurrencies = ['USD', 'VND', 'EUR', 'JPY', 'GBP'];
      const currencyCode = validCurrencies.includes(code) ? code : 'VND';

      const convertedPrice = price * rate;
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'code'
      }).format(convertedPrice);
    } catch (error) {
      console.error('Lỗi định dạng tiền tệ:', error);
      return `${price * rate} ${code}`;
    }
  }





  getImageProduct(fileName: string | undefined): string {
    return this.productService.getImageProduct(fileName);
  }
  getImageColor(fileName: string | undefined): string {
    return this.productService.getColorImage(fileName);
  }

  getSizeProduct(productId: number): Observable<SizeDTO[]> {
    return this.productService.getSizeProduct(productId).pipe(
      map((response: ApiResponse<SizeDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  getColorNameProduct(productId: number): Observable<ColorDTO[]> {
    return this.productService.getColorNameProduct(productId).pipe(
      map(
        (response: ApiResponse<ColorDTO[]>) => response.data || []
      ), // Chỉ lấy `data`
      catchError(() => of([])) // Trả về mảng rỗng nếu lỗi
    );
  }

  changeImageOne(productId: number, colorId: number): Observable<ImagesDetailProductDTO[] | null> {
    return this.productService.getChangeImageOne(productId, colorId).pipe(
      map((response: ApiResponse<ImagesDetailProductDTO[]>) => {
        return response.data || null;
      }),
      catchError((error) => {
        return of(null);
      })
    );
  }

  // lấy all review
  getReviewDetailProduct(
    productId: number,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string
  ): Observable<ReviewDetailProductDTO[]> {
    return this.reviewService.getReviewDetailProduct(productId, page, size, sortBy, sortDir).pipe(
      map((response: ApiResponse<PageResponse<ReviewDetailProductDTO[]>>) =>
        response.data?.content ? response.data.content.flat() : []
      ),
      catchError(() => of([]))
    );
  }



  // lấy giá sale
  getSalePrice(productId: number, colorId: number, sizeId: number): Observable<number> {
    return this.productService.getSalePrice(productId, colorId, sizeId).pipe(
      map((response: ApiResponse<VariantsDetailProductDTO>) => response.data?.salePrice ?? 0),
      catchError(() => of(0))
    );
  }
  getDataVariants(productId: number, colorId: number, sizeId: number): Observable<VariantsDetailProductDTO | null> {
    return this.productService.getSalePrice(productId, colorId, sizeId).pipe(
      map((response: ApiResponse<VariantsDetailProductDTO>) => response.data || null),
      catchError(() => of(null))
    );
  }
  //chọn để lấy giá trị màu và sizesize

  selectSize(size: SizeDTO): void {
    this.selectedSizeId = size.id;
    this.sizeId = size.id;

    this.getSalePrice(this.productId ?? 0, this.colorId ?? 0, size.id).subscribe(price => {
      this.salePrice = price;
      this.cdr.detectChanges();
    });
    this.getStatusQuantityInStock(this.productId ?? 0, this.colorId ?? 0, size.id).subscribe(qty => {
      console.log(qty?.quantityInStock)
      this.quantityInStock = qty; // Nếu null, gán giá trị mặc định là 0
      this.cdr.detectChanges();
    });

    this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
      this.variantId = price?.id;
      console.log('variantId : ' + this.variantId)

      this.cdr.detectChanges();
    });

    this.updateUrl(this.productId ?? 0, this.colorId ?? 0, size.id);
  }
  mediaId: number = 0
  checkMedia: boolean = false
  selectColor(color: ColorDTO): void {
    this.selectedColorId = color.id;
    this.colorId = color.id;

    this.getSalePrice(this.productId ?? 0, color.id, this.sizeId ?? 0).subscribe(price => {
      this.salePrice = price;
      this.cdr.detectChanges();
    });

    this.getQuantityInStock(this.productId ?? 0, color.id).subscribe(colorList => {
      this.dataQuantityInStock = colorList
    })
    this.getStatusQuantityInStock(this.productId ?? 0, color.id, this.sizeId ?? 0).subscribe(qty => {
      this.quantityInStock = qty;
      this.cdr.detectChanges(); // Cập nhật giao diện ngay khi có dữ liệu mới
    });

    this.changeImageOne(this.productId ?? 0, color.id).subscribe(images => {
      if (images) {
        this.dataImagesProduct[0].mediaUrl = images[0].mediaUrl; // Cập nhật danh sách ảnh
        this.mediaId = images[0].id
        this.checkMedia = images[0].hasVariants

        console.log('mediaId : ' + this.mediaId)

        this.cdr.detectChanges();
      }
    });
    this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
      this.variantId = price?.id;

      this.cdr.detectChanges();
    });


    this.updateUrl(this.productId ?? 0, color.id, this.sizeId ?? 0);

  }
  //---------



  isSizeOutOfStock(size: any): boolean {
    const variant = this.dataQuantityInStock.find(
      v => v.colorName === this.selectedColorName && v.sizeName === size.valueName
    );
    return variant ? variant.quantityInStock === 0 : false;
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
  getStatusQuantityInStock(productId: number, colorId: number, sizeId: number): Observable<InventoryDTO | null> {
    return this.productService.getStatusQuantityInStock(productId, colorId, sizeId).pipe(
      map((response: ApiResponse<InventoryDTO>) => response.data || null),
      catchError(() => of(null))
    )
  }

  // lấy tên khi chọn
  get selectedSizeName(): string {
    const selectedSize = this.dataSizes.find(size => size.id === this.selectedSizeId);
    if (!selectedSize || this.isSizeOutOfStock(selectedSize)) {
      return 'Hết hàng';
    }
    return selectedSize.valueName;
  }

  get selectedColorName(): string {
    return this.dataColors.find(color => color.id === this.selectedColorId)?.valueName || 'Không xác định';
  }
  // ----------------

  // đổi url khi đổi màu và size
  updateUrl(productId: number, colorId: number, sizeId: number): void {
    const newUrl = `/client/${this.currentCurrency}/${this.currentLang}/detail_product/${productId}/${colorId}/${sizeId}`;
    this.location.replaceState(newUrl);
  }

  //lấy cate cha
  getCategoryParent(lang: string, productId: number): Observable<CategoryParentDTO[]> {
    return this.productService.getCategoryParent(lang, productId)
      .pipe(
        map((response: ApiResponse<CategoryParentDTO[]>) => response.data || []),
        catchError(() => of([]))
      )
  }

  isDetailsOpen: boolean = false;
  isCareOpen: boolean = false;

  toggleAccordion(section: string): void {
    if (section === 'details') {
      this.isDetailsOpen = !this.isDetailsOpen;
    } else if (section === 'care') {
      this.isCareOpen = !this.isCareOpen;
    }
  }



  getFullStars(rating: number): Array<number> {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): Array<number> {
    return Array(5 - Math.floor(rating)).fill(0);
  }


  toggleWishlist(userId: number, productId: number, colorId: number): void {

    if (userId === 0) {
      const confirmRedirect = window.confirm(
        'Bạn cần đăng nhập để truy cập. Bạn có muốn chuyển đến trang đăng nhập không?'
      );
      if (confirmRedirect) {
        this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/login`]);
      }
    }

    this.wishlistService.toggleWishlistInProductDetail(userId, productId, colorId).subscribe({
      next: (response) => {
        console.log('Message:', response.message);
        console.log('Response Data:', response.data);
        this.wishlistService.getWishlistTotal(userId);
        this.checkWishlist(userId, productId, colorId);
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }


  checkWishlist(userId: number, productId: number, colorId: number) {
    if (!userId || !productId || !colorId) {
      console.warn('Dữ liệu không hợp lệ:', { userId, productId, colorId });
      return;
    }

    this.productService.isInWishlist(userId, productId, colorId).subscribe({
      next: (response) => {

        // ✅ Lấy giá trị đúng key từ API (`isInWishList` thay vì `isInWishlist`)
        this.isWishlist = response.data?.isInWishList ?? false;

      },
      error: (error) => {
        console.error('Lỗi khi kiểm tra wishlist:', error);
        this.isWishlist = false; // ✅ Nếu API lỗi, tránh bị undefined
      }
    });
  }





}
