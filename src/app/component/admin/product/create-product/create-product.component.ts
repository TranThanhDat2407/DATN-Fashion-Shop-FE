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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ProductServiceService } from "../../../../services/client/ProductService/product-service.service";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { TokenService } from "../../../../services/token/token.service";
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
import { DialogComponent } from "../../dialog/dialog.component";
import { ToastrService } from "ngx-toastr";
import { LanguageDTO } from "../../../../dto/LanguageDTO";
import { LanguagesService } from "../../../../services/LanguagesService/languages.service";
import { TranslationDTO } from "../../../../dto/CategoryAdminDTO";
import { response } from "express";

 export interface TranslationCreate  {
  name: string,
  description: string,
  material: string,
  care: string,
  langCode: string
}


 export interface CreateProduct {
  status: string,
  basePrice: number,
  isActive: boolean,
  translations: TranslationCreate[]

}
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NavBottomComponent, ModalNotifyErrorComponent, NgClass,
    FormsModule, ModelNotifySuccsessComponent, HeaderAdminComponent, DialogComponent
  ],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss'
})
export class CreateProductComponent implements OnInit {
  productId?: number;
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
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  imageUrl: string | ArrayBuffer | null =
    'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg';
  page: number = 0
  size: number = 3
  sortBy: string = 'id'
  sortDir: string = 'desc'

  isWishlist: boolean = false;
  sessionId?: string;
  cart: CreateCartDTO = { productVariantId: 0, quantity: 0 };

  dataLanguage: LanguageDTO[] = []
  translationsName: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));

  translationsDescription: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));
  translationsMaterial: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));
  translationsCare: TranslationDTO[] = this.dataLanguage.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));



  // translations: TranslationDTO[] = [
  //   { languageCode: 'vi', name: 'Sản phẩm A' },
  //   { languageCode: 'en', name: 'Product A' }
  // ];
  constructor(
    private navigationService: NavigationService,
    private routerActi: ActivatedRoute,
    private productService: ProductServiceService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private sessionService: SessionService,
    private toastService: ToastrService,
    private languagesService: LanguagesService,


  ) {
    this.sessionId = this.cookieService.get('SESSION_ID') || '';

  }
  submit() {
    console.log('translationsName ', this.translationsName);
    console.log('translationsDescription ', this.translationsDescription);
    console.log('translationsMaterial ', this.translationsMaterial);
    console.log('translationsCare ', this.translationsCare);
  }

  basePrice: number = 0

  createProduct(): void {
    if (!this.validateTranslations()) return;

    let translations: TranslationCreate[] = [];

    this.dataLanguage.forEach(item => {
      let nameData = this.translationsName.find(t => t.languageCode === item.code);
      let descriptionData = this.translationsDescription.find(t => t.languageCode === item.code);
      let materialData = this.translationsMaterial.find(t => t.languageCode === item.code);
      let careData = this.translationsCare.find(t => t.languageCode === item.code);

      if (nameData || descriptionData || materialData || careData) {
        translations.push({
          langCode: item.code,
          name: nameData?.name || '',
          description: descriptionData?.name || '',
          material: materialData?.name || '',
          care: careData?.name || ''
        });
      }
    });

    let product: CreateProduct = {
      status: "active",
      basePrice: this.basePrice,
      isActive: false,
      translations: translations
    };

    if (this.selectedFiles.length === 0) {
      this.toastService.error('Please select an image file!', "Error", { timeOut: 3000 });
      return;
    }

    const formData = new FormData();

    formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

    this.selectedFiles.forEach(file => {
      formData.append('mediaFiles', file);
    });

    console.log("Product Data: ", product);

    this.productService.createProduct(formData).subscribe(
      {
        next: response => {
          this.toastService.success('Success', 'Product created successfully!', { timeOut: 3000 });
          this.resetForm()
        },
        error: error => {
          this.toastService.error('Error', 'There was an error creating the Product.', { timeOut: 3000 });
          console.log(error);
        }
      }
    )

  }

  resetForm(): void {
    this.basePrice = 0; // Hoặc giá trị mặc định khác
    this.selectedFiles = [];
    this.translationsName = [];
    this.translationsDescription = [];
    this.translationsMaterial = [];
    this.translationsCare = [];
    this.previewUrls= []; 

 
  }
  validateTranslations(): boolean {
    const checkEmptyFields = (translations: TranslationDTO[], fieldName: string): boolean => {
      if (translations.every(t => t.name.trim() === '')) {
        this.toastService.error(`${fieldName} cannot be empty in all languages!`, 'Validation Error', { timeOut: 1600 });
        return false;
      }
      return true;
    };

    const isValidName = checkEmptyFields(this.translationsName, 'Name');
    const isValidDescription = checkEmptyFields(this.translationsDescription, 'Description');
    const isValidMaterial = checkEmptyFields(this.translationsMaterial, 'Material');
    const isValidCare = checkEmptyFields(this.translationsCare, 'Care');

    if (!isValidName || !isValidDescription || !isValidMaterial || !isValidCare) {
      return false;
    }

    return true;
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


  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);
    this.getIdsFromProductRouter();
    this.userId = this.tokenService.getUserId() ?? 0;
    this.sessionId = this.sessionService.getSession() ?? ''

    this.loadProductId();
    this.fetchDetailProduct(1)

    // Lắng nghe sự kiện Back trên trình duyệt
    window.addEventListener('popstate', () => {
      this.loadProductId();
    });
    // this.cartService.getQtyCart(this.userId,this.sessionId);

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

    try {
      const response = await firstValueFrom(
        forkJoin({
          dataSizes: this.getSizeProduct(productId).pipe(catchError(() => of([]))),
          dataColors: this.getColorNameProduct(productId).pipe(catchError(() => of([]))),
          dataLanguage: this.getLanguages().pipe(catchError(() => of([])))
        })
      );

      this.dataSizes = response.dataSizes;
      this.dataLanguage = response.dataLanguage;



      console.log("object:", this.dataLanguage);

      if (this.dataImagesProduct?.length) {
        this.colorImage = this.dataImagesProduct.find(img => img.colorId);
        this.noColorImages = this.dataImagesProduct.filter(img => !img.colorId);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
  }
  expandedStates: { [key: string]: boolean } = {};

  toggleDetails(key: string) {
    this.expandedStates[key] = !this.expandedStates[key];
  }

  getLanguages(): Observable<LanguageDTO[]> {
    return this.languagesService.getLanguages().pipe(
      map((response: ApiResponse<LanguageDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
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




  selectSize(size: SizeDTO): void {
    // this.selectedSizeId = size.id;
    // this.sizeId = size.id;

    // this.getSalePrice(this.productId ?? 0, this.colorId ?? 0, size.id).subscribe(price => {
    //   this.salePrice = price;
    //   this.cdr.detectChanges();
    // });
    // this.getStatusQuantityInStock(this.productId ?? 0, this.colorId ?? 0, size.id).subscribe(qty => {
    //   console.log(qty?.quantityInStock)
    //   this.quantityInStock = qty;  
    //   this.cdr.detectChanges();
    // });

    // this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
    //   this.variantId = price?.id;
    //   console.log('variantId : ' + this.variantId)

    //   this.cdr.detectChanges();
    // });

  }
  getImageColor(fileName: string | undefined): string {
    return this.productService.getColorImage(fileName);
  }
  get selectedSizeName(): string {
    const selectedSize = this.dataSizes.find(size => size.id === this.selectedSizeId);
    return selectedSize?.valueName || ''; // Trả về chuỗi rỗng nếu selectedSize là undefined
  }


  get selectedColorName(): string {
    return this.dataColors.find(color => color.id === this.selectedColorId)?.valueName || 'Không xác định';
  }
  selectColor(color: ColorDTO): void {
    // this.selectedColorId = color.id;
    // this.colorId = color.id;

    // this.getSalePrice(this.productId ?? 0, color.id, this.sizeId ?? 0).subscribe(price => {
    //   this.salePrice = price;
    //   this.cdr.detectChanges();
    // });

    // this.getQuantityInStock(this.productId ?? 0, color.id).subscribe(colorList => {
    //   this.dataQuantityInStock = colorList
    // })
    // this.getStatusQuantityInStock(this.productId ?? 0, color.id, this.sizeId ?? 0).subscribe(qty => {
    //   this.quantityInStock = qty;
    //   this.cdr.detectChanges();  
    // });


    // this.getDataVariants(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0).subscribe(price => {
    //   this.variantId = price?.id;
    //   console.log('variantId : ' + this.variantId)

    //   this.cdr.detectChanges();
    // });



  }
  //---------




}
