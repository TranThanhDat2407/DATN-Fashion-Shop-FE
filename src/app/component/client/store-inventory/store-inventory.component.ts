import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {SizeDTO} from '../../../models/sizeDTO';
import {ColorDTO} from '../../../models/colorDTO';
import {catchError, firstValueFrom, forkJoin, map, Observable, of, take} from 'rxjs';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {ImagesDetailProductDTO} from '../../../dto/ImagesDetailProductDTO';
import {DetailProductDTO} from '../../../dto/DetailProductDTO';
import {CommonModule, isPlatformBrowser, Location} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import { ProductServiceService } from '../../../services/client/ProductService/product-service.service';
import { DetailProductService } from '../../../services/client/DetailProductService/detail-product-service.service';
import { NavigationService } from '../../../services/Navigation/navigation.service';
import {ListStoreDTO} from '../../../dto/ListStoreDTO';
import {StoreService} from '../../../services/client/store/store.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-store-inventory',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, FormsModule],
  templateUrl: './store-inventory.component.html',
  styleUrl: './store-inventory.component.scss'
})
export class StoreInventoryComponent implements OnInit{
  currentLang: string = '';
  currentCurrency: string = '';

  productId?: number;
  colorId?: number;
  sizeId?: number;
  selectedSizeId!: number;
  selectedColorId!: number;

  productImageUrl: string = '';
  dataSizes: SizeDTO[] = [];
  dataColors: ColorDTO[] = [];
  dataDetailsProduct: DetailProductDTO | null = null;

  showMoreButton = false;
  pageSize = 2;
  currentPage = 1;

  stores: (ListStoreDTO & { quantity?: number })[] = [];
  userLatitude!: number;
  userLongitude!: number;
  searchQuery: string = '';
  loading: boolean = true;

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private storeService: StoreService,
    private routerActi: ActivatedRoute,
    private productService: ProductServiceService,
    private detailProductService: DetailProductService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: object

  ) {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });
  }

  async ngOnInit(): Promise<void> {
    this.currentLang = await firstValueFrom(this.navigationService.currentLang$);
    this.currentCurrency = await firstValueFrom(this.navigationService.currentCurrency$);

    this.getIdsFromProductRouter();
    this.getUserLocation();

    this.fetchDetailProduct(this.productId ?? 0).then(() => {
      this.selectedSizeId = this.sizeId ?? 0; // Đánh dấu size được chọn
      this.selectedColorId = this.colorId ?? 0; // Đánh dấu size được chọn
    });
    this.updateUrl(this.productId ?? 0, this.colorId ?? 0, this.sizeId ?? 0);

  }

  async fetchDetailProduct(productId: number): Promise<void> {
    if (!productId) return;

    const response = await firstValueFrom(
      forkJoin({
        dataSizes: this.getSizeProduct(productId).pipe(catchError(() => of([]))),
        dataColors: this.getColorNameProduct(productId).pipe(catchError(() => of([]))),
        productImageUrl: this.changeImageOne(productId, this.colorId ?? 0).pipe(catchError(() => of(null))),
        dataDetailsProduct: this.getDetailsProduct(this.currentLang, productId).pipe(catchError(() => of(null))),
      })
    );

    this.dataSizes = response.dataSizes;
    this.dataColors = response.dataColors;
    this.dataDetailsProduct = response.dataDetailsProduct;

    if (response.productImageUrl && response.productImageUrl.length > 0) {
      this.productImageUrl = response.productImageUrl[0].mediaUrl;
    } else {
      this.productImageUrl = 'assets/images/no-image.jpg'; // Ảnh mặc định nếu không có ảnh nào
    }

  }

  getImageProduct(fileName: string | undefined): string {
    return this.productService.getImageProduct(fileName);
  }

  getIdsFromProductRouter(): void {
    this.routerActi.params.pipe(take(1)).subscribe(params => {
      this.productId = Number(params['productId']) || 0;
      this.colorId = Number(params['colorId']) || 0;
      this.sizeId = Number(params['sizeId']) || 0;
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
      ), // Chỉ lấy data
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

  getImageColor(fileName: string | undefined): string {
    return this.productService.getColorImage(fileName);
  }

  get selectedSizeName(): string {
    const selectedSize = this.dataSizes.find(size => size.id === this.selectedSizeId);
    if (!selectedSize) {
      return '';
    }
    return selectedSize.valueName;
  }

  get selectedColorName(): string {
    return this.dataColors.find(color => color.id === this.selectedColorId)?.valueName || 'Không xác định';
  }
  // ----------------

  // đổi url khi đổi màu và size
  updateUrl(productId: number, colorId: number, sizeId: number): void {
    const newUrl = `/client/${this.currentCurrency}/${this.currentLang}/store_inventory/${productId}/${colorId}/${sizeId}`;
    this.location.replaceState(newUrl);
  }

  getDetailsProduct(lang: string, productId: number): Observable<DetailProductDTO | null> {
    return this.detailProductService.getDetailProduct(lang, productId).pipe(
      map((response: ApiResponse<DetailProductDTO>) => response?.data ?? null),
      catchError((error) => {
        console.error("Lỗi khi gọi API getDetailsProduct:", error);
        return of(null);
      })
    );
  }


  selectColor(color: ColorDTO): void {
    this.selectedColorId = color.id;
    this.colorId = color.id;

    this.changeImageOne(this.productId ?? 0, color.id).subscribe(images => {
      if (images) {
        this.productImageUrl = images[0].mediaUrl;
        this.cdr.detectChanges();
      }
    });

    this.updateUrl(this.productId ?? 0, color.id, this.sizeId ?? 0);
    this.fetchStores();
  }

  selectSize(size: SizeDTO): void {
    this.selectedSizeId = size.id;
    this.sizeId = size.id;

    this.updateUrl(this.productId ?? 0, this.colorId ?? 0, size.id);
    this.fetchStores();
  }

  getUserLocation(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLatitude = position.coords.latitude;
            this.userLongitude = position.coords.longitude;
            this.fetchStores();
          },
          (error) => {
            console.error("Lỗi khi lấy vị trí:", error);
            this.loading = false;
            this.fetchStores();
          }
        );
      } else {
        console.error("Trình duyệt không hỗ trợ Geolocation.");
        this.loading = false;
        this.fetchStores();
      }
    } else {
      this.loading = false;
      this.fetchStores();
    }
  }

  fetchStores(): void {
    this.loading = true;

    // Truyền userLatitude và userLongitude vào API
    this.storeService
      .getStores(
        this.currentPage - 1,
        this.pageSize,
        this.searchQuery,  // Tìm kiếm theo name
        this.userLatitude, // Truyền latitude của người dùng
        this.userLongitude // Truyền longitude của người dùng
      )
      .subscribe((response) => {
        if (response?.data) {
          this.stores = response.data.content.map((store) => ({
            ...store,
            distance: store.distance,
          }));

          // Kiểm tra nếu có nút "Xem thêm"
          this.showMoreButton = response.data.content.length === this.pageSize && response.data.pageNo < response.data.totalPages - 1;
          this.fetchInventoryForStores(this.stores);
        }

        this.loading = false;
      });
  }

  fetchInventoryForStores(stores: (ListStoreDTO )[]): void {
    const inventoryRequests = stores.map((store) =>
      this.storeService.getStoreInventory(this.productId!, this.colorId!, this.sizeId!, store.id)
    );

    forkJoin(inventoryRequests).subscribe((quantities) => {
      this.stores = stores.map((store, index) => ({
        ...store,
        quantity: quantities[index]?.data?.quantityInStock ?? 0
      })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

      this.loading = false;
    });
  }

  showMoreStore(){
    this.pageSize = this.pageSize + 5;
    this.fetchStores()
  }

}
