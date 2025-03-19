import { CategoryParentDTO } from "../../../../dto/CategoryParentDTO";
import { CreateCartDTO } from "../../../../dto/CreateCartDTO";
import { DetailProductDTO } from "../../../../dto/DetailProductDTO";
import { ImagesDetailProductDTO } from "../../../../dto/ImagesDetailProductDTO";
import { InventoryDTO } from "../../../../dto/InventoryDTO";
import { ReviewDetailProductDTO } from "../../../../dto/ReviewDetailProductDTO";
import { VariantsDetailProductDTO } from "../../../../dto/VariantsDetailProductDTO";
import { ColorDTO } from "../../../../models/colorDTO";
import { Currency } from "../../../../models/Currency";
import { SizeDTO } from "../../../../models/sizeDTO";
import { NavigationService } from "../../../../services/Navigation/navigation.service";
import {ActivatedRoute, Router, RouterLink, RouterOutlet} from "@angular/router";
import { ProductServiceService } from "../../../../services/client/ProductService/product-service.service";
import { DetailProductService } from "../../../../services/client/DetailProductService/detail-product-service.service";
import { ReviewServiceService } from "../../../../services/client/ReviewService/review-service.service";
import { CurrencyService } from "../../../../services/currency/currency-service.service";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { WishlistService } from "../../../../services/client/wishlist/wishlist.service";
import { TokenService } from "../../../../services/token/token.service";
import { CartService } from "../../../../services/client/CartService/cart.service";
import { CookieService } from "ngx-cookie-service";
import { MatDialog } from "@angular/material/dialog";
import { SessionService } from "../../../../services/session/session.service";
import { catchError, firstValueFrom, forkJoin, map, Observable, of, take } from "rxjs";
import { CommonModule, Location, NgClass } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { NavBottomComponent } from "../../../client/nav-bottom/nav-bottom.component";
import { ModalNotifyErrorComponent } from "../../../client/Modal-notify/modal-notify-error/modal-notify-error.component";
import { ModelNotifySuccsessComponent } from "../../../client/Modal-notify/model-notify-succsess/model-notify-succsess.component";
import { FormsModule } from "@angular/forms";
import { HeaderAdminComponent } from "../../header-admin/header-admin.component";
import { ApiResponse } from "../../../../dto/Response/ApiResponse";
import { PageResponse } from "../../../../dto/Response/page-response";
import { ReviewTotalDTO } from "../../../../dto/ReviewTotalDTO";
import { ReviewAverageDTO } from "../../../../dto/ReviewAverageDTO";
import { env } from "process";
import { DialogComponent } from "../../dialog/dialog.component";
import { ToastrService } from "ngx-toastr";
import { response } from "express";
import { error } from "console";
import { LanguageDTO } from "../../../../dto/LanguageDTO";
import { TranslationDTO } from "../../../../dto/CategoryAdminDTO";
import { LanguagesService } from "../../../../services/LanguagesService/languages.service";
import { Translation } from "../create-product/create-product.component";
import {EditCategoryForProductComponent} from './edit-category-for-product/edit-category-for-product.component';


export interface EditProduct {
  id :  number,
  status: string,
  basePrice: number,
  isActive: boolean,
  translations: Translation[]

}

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavBottomComponent, ModalNotifyErrorComponent, NgClass,
    FormsModule, ModelNotifySuccsessComponent, HeaderAdminComponent, DialogComponent, EditCategoryForProductComponent, RouterOutlet
  ],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss'
})
export class EditProductComponent implements OnInit {
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
  selectedFiles: File[] = []; // Danh sách file được chọn
  previewUrls: string[] = [];
  imageUrl: string | ArrayBuffer | null =
    'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg';
  page: number = 0
  size: number = 3
  sortBy: string = 'id'
  sortDir: string = 'desc'
  dataEditProduct : EditProduct | null= null

  isWishlist: boolean = false;
  sessionId?: string;

  dataLanguage: LanguageDTO[] = []
  translationsName: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));

  translationsDescription: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: 'sstrrtg'
  }));
  translationsMaterial: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));
  translationsCare: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));

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
    private tokenService: TokenService,
    private cookieService: CookieService,
    private sessionService: SessionService,
    private diaLog: MatDialog,
    private toastService: ToastrService,
    private languagesService: LanguagesService

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


    // Lắng nghe sự kiện Back trên trình duyệt
    window.addEventListener('popstate', () => {
      this.loadProductId();
    });
    // this.cartService.getQtyCart(this.userId,this.sessionId);
    this.routerActi.params.subscribe(params => {
      this.productId = Number(params['id']) || 0;
      this.colorId = Number(params['colorId']) || 0;
      this.sizeId = Number(params['sizeId']) || 0;
      console.log(this.productId)
      console.log(this.colorId)
      console.log(this.sizeId)


      this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
        this.variantId = price?.id;
        console.log('variantId : ' + this.variantId)

      });



      this.fetchDetailProduct(this.productId ?? 0).then(() => {
        this.selectedSizeId = this.sizeId ?? 0; // Đánh dấu size được chọn
        this.selectedColorId = this.colorId ?? 0; // Đánh dấu size được chọn
      });

      this.translationsName = this.dataLanguage.map(lang => ({
        languageCode: 'vi',
        name: 'srehthgsrehthg'
      }));

    });
  }



  loadProductId() {
    this.routerActi.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.productId = id;
      }
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
        dataDetailsProduct: this.getDetailsProduct('en', productId).pipe(catchError(() => of(null))),
        dataQuantityInStock: this.getQuantityInStock(productId, this.colorId ?? 0).pipe(catchError(() => of([]))),
        reviewTotal: this.getReviewTotal(productId).pipe(catchError(() => of(0))),
        dataVideoProduct: this.getVideosProduct(productId).pipe(catchError(() => of([]))),
        dataReviewDetailProduct: this.getReviewDetailProduct(productId, this.page, this.size, this.sortBy, this.sortDir).pipe(catchError(() => of([]))),
        dataLanguage: this.getLanguages().pipe(catchError(() => of([]))),
        dataEditProduct : this.editProduct(productId).pipe(catchError(() => of(null)))


      })
    );

    this.dataImagesProduct = response.allImagesProduct;
    this.dataSizes = response.dataSizes;
    this.salePrice = response.salePrice;
    this.dataVariants = response.dataVariants
    this.dataColors = response.dataColors;
    this.reviewTotal = response.reviewTotal;
    this.dataDetailsProduct = response.dataDetailsProduct
    this.dataQuantityInStock = response.dataQuantityInStock
    this.dataVideoProduct = response.dataVideoProduct
    this.dataReviewDetailProduct = response.dataReviewDetailProduct
    this.dataLanguage = response.dataLanguage;
    this.dataEditProduct = response.dataEditProduct

    // console.log("dataQuantityInStock : " + this.dataReviewDetailProduct[0].comment)
    console.log("object : " , this.dataEditProduct)

    if (this.dataImagesProduct?.length) {
      this.colorImage = this.dataImagesProduct.find(img => img.colorId);
      this.noColorImages = this.dataImagesProduct.filter(img => !img.colorId);
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

  }

  editProduct(productId: number) : Observable<EditProduct | null>{
    return this.productService.editProduct(productId).pipe(
      map((response : ApiResponse<EditProduct>)  =>  response.data || null),
      catchError(() => of(null))
    )
  }


  addImage = async (): Promise<void> => {

    if (!this.validateColor()) return;

    const result = await firstValueFrom(
      this.diaLog.open(DialogComponent, {
        width: '400px',
        data: { message: 'Are you sure you want to add image', confirm: 'ACCEPT' }
      }).afterClosed()
    );

    if (result === true) {
      for (const item of this.selectedFiles) {
        if (!item.type.startsWith('image/')) {
          this.toastService.error('Invalid File', 'Only image files are allowed.', { timeOut: 1500 });
          continue;
        }

        try {
          const formData = new FormData();
          formData.append('mediaFiles', item);

          await firstValueFrom(this.productService.uploadMedia(this.productId ?? 0, formData));
        } catch (error) {
          this.toastService.error('Error', 'There was an error uploading the image.', { timeOut: 1000 });
        }
      }
      this.previewUrls = [];
      this.fetchDetailProduct(this.productId ?? 0);
      this.toastService.success('Success', 'Images added successfully!', { timeOut: 1000 });
    } else {
      console.log('User canceled image upload.');
    }
  };

  getLanguages(): Observable<LanguageDTO[]> {
    return this.languagesService.getLanguages().pipe(
      map((response: ApiResponse<LanguageDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  getTranslationByCodeName(code: string): TranslationDTO {
    let translation = this.translationsName.find(item => item.languageCode === code);
    if (!translation) {
      translation = { languageCode: code, name: '' };
      this.translationsName.push(translation);
    }
    return translation;
  }

  getTranslationByCodeDescription(code: string): TranslationDTO {
    let translation = this.translationsDescription.find(item => item.languageCode === code);
    if (!translation) {
      translation = { languageCode: code, name: '' };
      this.translationsDescription.push(translation);
    }
    return translation;
  }
  getTranslationByCodeMaterial(code: string): TranslationDTO {
    let translation = this.translationsMaterial.find(item => item.languageCode === code);
    if (!translation) {
      translation = { languageCode: code, name: '' };
      this.translationsMaterial.push(translation);
    }
    return translation;
  }
  getTranslationByCodeCare(code: string): TranslationDTO {
    let translation = this.translationsCare.find(item => item.languageCode === code);
    if (!translation) {
      translation = { languageCode: code, name: '' };
      this.translationsCare.push(translation);
    }
    return translation;
  }

  removeImageproduct(imageId: number): void {

    const diaLog = this.diaLog.open(DialogComponent, {
      data: { message: 'Are you want to delete image ?' }
    })

    diaLog.afterClosed().subscribe(result => {
      if (result == true) {
        this.productService.deleteImage(imageId).subscribe({
          next: response => {
            this.toastService.success('Success', 'Image Deleted successfully!', { timeOut: 3000 });
            this.fetchDetailProduct(this.productId ?? 0);
          },
          error: error => {
            this.toastService.error('Error', 'There was an error deleting the Image.', { timeOut: 3000 });
          }
        })
      }
    })

    console.log('clickkkk', imageId)
    // const confirmDelete = confirm("Are you sure you want to delete this image?");
    // if (confirmDelete) {
    //   this.dataImagesProduct.splice(index, 1); // Xóa khỏi danh sách hiển thị

    //   // Gọi API để xóa ảnh khỏi database
    //   this.productService.deleteImage(imageId).subscribe({
    //     next: () => {
    //       this.toastService.success("Success", "Image deleted successfully!", { timeOut: 1000 });
    //     },
    //     error: () => {
    //       this.toastService.error("Error", "Failed to delete image!", { timeOut: 1000 });
    //     }
    //   });
    // }
  }

  validateColor(): boolean {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (this.selectedFiles.length === 0) {
      this.toastService.error("No files selected!", "Error", { timeOut: 3000 });
      return false;
    }

    for (const file of this.selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error(`Invalid file type: ${file.name}. Only PNG, JPG, JPEG, WEBP allowed.`, "Error", { timeOut: 3000 });
        return false;
      }

      if (file.size > maxSize) {
        this.toastService.error(`File ${file.name} exceeds the 5MB limit!`, "Error", { timeOut: 3000 });
        return false;
      }
    }



    return true;
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      console.log(this.selectedFiles)
      this.previewUrls = [];

      for (let file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1); // Xóa file khỏi danh sách
    this.previewUrls.splice(index, 1); // Xóa URL ảnh khỏi danh sách
  }







  getIdsFromProductRouter(): void {
    this.routerActi.params.pipe(take(1)).subscribe(params => {
      this.productId = Number(params['productId']) || 0;

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
      const index = { en: 0, vi: 1, jp: 2 }[this.currentLang] ?? 0;
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

  }

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

    // this.changeImageOne(this.productId ?? 0, color.id).subscribe(images => {
    //   if (images) {
    //     this.dataImagesProduct[0].mediaUrl = images[0].mediaUrl;
    //     this.cdr.detectChanges();
    //   }
    // });
    this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
      this.variantId = price?.id;
      console.log('variantId : ' + this.variantId)

      this.cdr.detectChanges();
    });



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
    // const newUrl = `/admin/edit_product/${productId}/${colorId}/${sizeId}`;
    const newUrl = `/admin/edit_product`;

    this.location.replaceState(newUrl);
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



  openModal() {
    this.router.navigate([`../admin/edit_product/${this.productId}/edit-category-for-product`], { relativeTo: this.router.routerState.root });
  }

}
