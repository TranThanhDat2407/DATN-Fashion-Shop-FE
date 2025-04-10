import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ListStoreStockDTO} from '../../../dto/ListStoreStockDTO';
import {HttpClient} from '@angular/common/http';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {StoreService} from '../../../services/client/store/store.service';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {PageResponse} from '../../../dto/Response/page-response';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {FormsModule} from '@angular/forms';
import {CategoryDTO} from '../../../dto/CategoryDTO';
import {CategoryAdminService} from '../../../services/admin/CategoryService/category.service';
import {catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {LanguageDTO} from '../../../dto/LanguageDTO';
import {LanguagesService} from '../../../services/LanguagesService/languages.service';
import {TranslationDTO} from '../../../dto/CategoryAdminDTO';
import {NgxBarcode6Module} from 'ngx-barcode6';
import {HeaderAdminComponent} from '../../admin/header-admin/header-admin.component';

interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean
  subCategories: Category[];
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    NgForOf,
    NgIf,
    NgClass,
    StoreHeaderComponent,
    FormsModule,
    NgxBarcode6Module,
    HeaderAdminComponent,
    RouterLink
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  stockList: ListStoreStockDTO[] = [];
  pageNo = 0;
  totalPages = 0;
  storeId!: number;

  languageCode: string = 'vi';
  productName?: string;
  categoryId?: number;
  sortBy: string = 'productVariant.product.id';
  sortDir: string = 'asc';

  // category
  listCategory: Category[] = []
  dataParentCategories: CategoryDTO[] =[]
  id!: number;

  parentId?: any
  categoryChildren: Category[] = [];
  categorySubChildren: Category[] = [];
  categorySubSubChildren: Category[] = [];

  dataLanguages: LanguageDTO[] = [];
  translations: TranslationDTO[] = this.dataLanguages.map(lang => ({
    languageCode: lang.code,
    name: ''
  }));
// --------------------------
  // Custom select: Sản phẩm (Ví dụ)
  // --------------------------
  isOpen: boolean = false;
  searchText: string = '';
  selectedItem: any = null;


  // --------------------------
  // Custom select: Category Parent
  // --------------------------
  isOpenCategoryParent: boolean = false;
  searchTextCategoryParent: string = '';
  selectedCategoryParent: Category | null = null;

  // --------------------------
  // Custom select: Category Child
  // --------------------------
  isOpenCategoryChild: boolean = false;
  searchTextCategoryChild: string = '';
  selectedCategoryChild: Category | null = null;

  // --------------------------
  // Custom select: Category Sub Child
  // --------------------------
  isOpenCategorySubChild: boolean = false;
  searchTextCategorySubChild: string = '';
  selectedCategorySubChild: Category | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storeService: StoreService,
    private categoryAdminService: CategoryAdminService,
    private languagesSrevice: LanguagesService,
  ) {}

  async ngOnInit() {

    this.route.parent?.paramMap.subscribe(params => {
      const storeIdParam = params.get('storeId'); // Dùng .get() để lấy giá trị
      if (storeIdParam) {
        this.storeId = Number(storeIdParam);
        if (!isNaN(this.storeId)) {
          this.fetchStockData();
        } else {
          console.error('Lỗi: storeId không hợp lệ:', storeIdParam);
        }
      } else {
        console.error('Lỗi: Không tìm thấy storeId trong URL');
      }
    });
    await this.fetchCategory();
    this.listCategory = await firstValueFrom(this.buildCategoryTree());
  }

// Thêm các biến mới vào component
  pageSize: number = 10; // Default page size
  maxDisplayedPages: number = 10; // Số trang tối đa hiển thị
  additionalPages: number = 10; // Số trang thêm vào khi đạt đến giới hạn

// Hàm thay đổi page size
  onPageSizeChange(): void {
    this.pageNo = 0; // Reset về trang đầu tiên khi thay đổi page size
    this.fetchStockData();
  }

// Hàm thay đổi trang
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageNo = page;
      this.fetchStockData();
    }
  }

// Các hàm hỗ trợ hiển thị phân trang
  getDisplayedPages(): number[] {
    let startPage: number;
    let endPage: number;

    if (this.totalPages <= this.maxDisplayedPages) {
      // Hiển thị tất cả nếu tổng số trang ít
      startPage = 0;
      endPage = this.totalPages - 1;
    } else {
      // Tính toán các trang cần hiển thị
      if (this.pageNo <= this.maxDisplayedPages - 1) {
        startPage = 0;
        endPage = this.maxDisplayedPages - 1;
      } else {
        startPage = this.pageNo;
        endPage = Math.min(this.pageNo + this.additionalPages - 1, this.totalPages - 1);
      }
    }

    return Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
  }

  showFirstPage(): boolean {
    return this.getDisplayedPages()[0] > 0;
  }

  showLastPage(): boolean {
    return this.getDisplayedPages()[this.getDisplayedPages().length - 1] < this.totalPages - 1;
  }

  showFirstEllipsis(): boolean {
    return this.getDisplayedPages()[0] > 1;
  }

  showLastEllipsis(): boolean {
    return this.getDisplayedPages()[this.getDisplayedPages().length - 1] < this.totalPages - 2;
  }

// Cập nhật hàm fetchStockData để sử dụng pageSize
  fetchStockData() {
    const selectedCategoryId = this.selectedCategorySubChild?.id || this.selectedCategoryChild?.id || this.selectedCategoryParent?.id || null;
    this.storeService.getStoresStock(
      this.pageNo,
      this.pageSize, // Sử dụng pageSize thay vì giá trị cố định
      this.storeId,
      this.languageCode || 'vi',
      this.productName,
      selectedCategoryId,
      this.sortBy || 'id',
      this.sortDir || 'asc'
    ).subscribe({
      next: (response: ApiResponse<PageResponse<ListStoreStockDTO>>) => {
        if (response.data) {
          this.stockList = response.data.content;
          this.totalPages = response.data.totalPages;
        }
      },
      error: (err) => console.error('Lỗi tải dữ liệu kho:', err)
    });
  }

  buildCategoryTree(): Observable<Category[]> {
    // Giả sử this.dataParentCategories đã được load từ API (kiểu CategoryDTO[])
    return forkJoin(
      this.dataParentCategories.map((parentDto: CategoryDTO) => {
        // Chuyển đổi CategoryDTO của cha sang Category
        const parent: Category = {
          id: parentDto.id,
          name: parentDto.name,
          image: parentDto.imageUrl,
          isActive: parentDto.isActive,
          subCategories: []
        };

        // Lấy danh sách con của parent (tầng 2)
        return this.getChildCategories(parent.id).pipe(
          switchMap((childDtos: CategoryDTO[]) => {
            if (childDtos.length > 0) {
              // Với mỗi child, chuyển sang Category và lấy con của nó (tầng 3)
              return forkJoin(
                childDtos.map(childDto => {
                  const child: Category = {
                    id: childDto.id,
                    name: childDto.name,
                    image: childDto.imageUrl,
                    isActive: childDto.isActive,
                    subCategories: []
                  };

                  // Lấy con của child (tầng 3)
                  return this.getChildCategories(child.id).pipe(
                    map((grandChildDtos: CategoryDTO[]) => {
                      child.subCategories = grandChildDtos.map(grandChildDto => ({
                        id: grandChildDto.id,
                        name: grandChildDto.name,
                        image: grandChildDto.imageUrl,
                        isActive: grandChildDto.isActive,
                        subCategories: [] // Không cần tầng con tiếp theo
                      }));
                      return child;
                    })
                  );
                })
              ).pipe(
                map((children: Category[]) => {
                  parent.subCategories = children;
                  return parent;
                })
              );
            } else {
              parent.subCategories = [];
              return of(parent);
            }
          })
        );
      })
    );
  }


  getParentCategories(): Observable<CategoryDTO[]>{
    return this.categoryAdminService.getParentCategories().pipe(
      map((response :  ApiResponse<CategoryDTO[]>) => response.data || []),
      catchError(() => of ([]))
    )
  }
  getChildCategories(parentId: number): Observable<CategoryDTO[]> {

    return this.categoryAdminService.getSubCategoriesByParentId(parentId).pipe(
      map((response : ApiResponse<CategoryDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  filteredCategoriesParent(): Category[] {
    const search = this.removeVietnameseTones(this.searchTextCategoryParent.trim().toLowerCase());
    return search ? this.listCategory.filter(category =>
      this.removeVietnameseTones(category.name.toLowerCase()).includes(search)
    ) : this.listCategory;
  }

  filteredCategoriesChild(): Category[] {
    const search = this.removeVietnameseTones(this.searchTextCategoryChild.trim().toLowerCase());
    return search ? this.categoryChildren.filter(category =>
      this.removeVietnameseTones(category.name.toLowerCase()).includes(search)
    ) : this.categoryChildren;
  }

  filteredCategoriesSubChild(): Category[] {
    const search = this.removeVietnameseTones(this.searchTextCategorySubChild.trim().toLowerCase());
    return search ? this.categorySubChildren.filter(category =>
      this.removeVietnameseTones(category.name.toLowerCase()).includes(search)
    ) : this.categorySubChildren;
  }

  // --------------------------
  // HÀM XỬ LÝ CUSTOM SELECT CHO CATEGORY
  // --------------------------
  selectCategoryParent(category: Category): void {
    this.selectedCategoryParent = category;
    this.isOpenCategoryParent = false;
    this.searchTextCategoryParent = '';

    // Reset các lựa chọn cấp con
    this.selectedCategoryChild = null;
    this.selectedCategorySubChild = null;
    this.categoryChildren = [];
    this.categorySubChildren = [];
    this.categorySubSubChildren = [];

    this.getListCategoryChild(category.id);
    this.fetchStockData();
  }

  selectCategoryChild(category: Category): void {
    this.selectedCategoryChild = category;
    this.isOpenCategoryChild = false;
    this.searchTextCategoryChild = '';

    // Reset lựa chọn cấp con dưới
    this.selectedCategorySubChild = null;
    this.categorySubChildren = [];
    this.categorySubSubChildren = [];

    this.getListCategorySubChild(category.id);
    this.fetchStockData();

  }

  selectCategorySubChild(category: Category): void {
    this.selectedCategorySubChild = category;
    this.isOpenCategorySubChild = false;
    this.searchTextCategorySubChild = '';
    this.getListCategorySubSubChild(category.id);
    this.fetchStockData();
  }

  getListCategoryChild(categoriesIdChild: number | undefined): Category[] {
    if (categoriesIdChild !== undefined) {
      this.parentId = categoriesIdChild;
      console.log("parentId: " + this.parentId);
      const selectedCategory = this.listCategory.find(category => category.id === Number(categoriesIdChild));
      if (selectedCategory) {
        this.categoryChildren = selectedCategory.subCategories;
        return this.categoryChildren;
      } else {
        console.log('Không tìm thấy category với id:', categoriesIdChild);
        return [];
      }
    }
    return [];
  }

  getListCategorySubChild(categoriesIdChild: number | undefined): Category[] {
    if (categoriesIdChild !== undefined) {
      this.parentId = categoriesIdChild;
      console.log("parentId: " + this.parentId);
      const selectedCategory = this.categoryChildren.find(category => category.id === Number(categoriesIdChild));
      if (selectedCategory) {
        this.categorySubChildren = selectedCategory.subCategories;
        return this.categorySubChildren;
      } else {
        console.log('Không tìm thấy category con với id:', categoriesIdChild);
        return [];
      }
    }
    return [];
  }

  getListCategorySubSubChild(categoriesIdChild: number | undefined): void {
    if (categoriesIdChild !== undefined) {
      this.parentId = categoriesIdChild;
      console.log("Sub-Sub ParentId: " + categoriesIdChild);
      const selectedCategory = this.categorySubChildren.find(category => category.id === Number(categoriesIdChild));
      this.categorySubSubChildren = selectedCategory ? selectedCategory.subCategories : [];
    }
  }

  async fetchCategory(): Promise<void> {
    const callApis = {
      dataLanguages: this.getLanguages().pipe(catchError(() => of([]))),
      dataParentCategory:  this.getParentCategories().pipe(catchError(() => of([])))
    };

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataLanguages = response.dataLanguages;
    this.dataParentCategories = response.dataParentCategory
    // console.log("object: "+this.dataParentCategories )

    if (this.dataLanguages.length > 0) {
      this.initializeTranslations();
    } else {
      console.log('Không có dữ liệu ngôn ngữ');
    }
  }

  initializeTranslations(): void {
    this.translations = this.dataLanguages.map(lang => ({
      languageCode: lang.code,
      name: ''
    }));
  }

  getLanguages(): Observable<LanguageDTO[]> {
    return this.languagesSrevice.getLanguages().pipe(
      map((response: ApiResponse<LanguageDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  resetFilters() {
    this.productName = '';  // Xóa tìm kiếm tên sản phẩm
    this.selectedCategoryParent = null;
    this.selectedCategoryChild = null;
    this.selectedCategorySubChild = null;
    this.categoryId = undefined; // Xóa bộ lọc theo category
    this.sortBy = 'productVariant.product.id'; // Giá trị mặc định
    this.sortDir = 'asc'; // Giá trị mặc định
    this.pageNo = 0; // Quay về trang đầu tiên

    this.fetchStockData(); // Gọi API để tải lại dữ liệu
  }

  @ViewChildren('barcodeElement', { read: ElementRef }) barcodeElements!: QueryList<ElementRef>;

  printSingleTag(stock: any, index: number) {
    setTimeout(() => {
      const barcodeElement = this.barcodeElements.toArray()[index];
      if (!barcodeElement || !barcodeElement.nativeElement) {
        console.error('Barcode element chưa sẵn sàng.');
        return;
      }

      const svgElement = barcodeElement.nativeElement.querySelector('svg');
      if (!svgElement) {
        console.error('Không tìm thấy mã vạch SVG');
        return;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const encodedData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

      // Hiển thị ngày khuyến mãi nếu có
      const promotionDetails = stock.promotion
        ? `<p class="promotion-date">
          <strong></strong>
          ${new Date(stock.promotion.startDate).toLocaleDateString('vi-VN')}
          - ${new Date(stock.promotion.endDate).toLocaleDateString('vi-VN')}
         </p>`
        : '';

      // Kiểm tra nếu salePrice nhỏ hơn basePrice thì in đỏ
      const isDiscounted = stock.salePrice < stock.basePrice;
      const priceClass = stock.promotion || isDiscounted ? 'promo-price' : '';

      const printWindow = window.open("", "_blank", "width=400,height=600");
      if (!printWindow) {
        console.error("Cửa sổ in bị chặn!");
        return;
      }

      const printContent = `
    <html>
      <head>
        <title>Print Tag</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; background-color: #f8f8f8; text-align: center; }
          .tag-container {
            width: 300px;
            border: 2px solid black;
            border-radius: 10px;
            padding: 15px;
            background: white;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            margin: 20px auto;
            page-break-after: always;
          }
          h2 { margin: 5px 0; font-size: 20px; font-weight: bold; }
          p { margin: 5px 0; font-size: 14px; }
          .promotion-date { font-style: italic; color: #555; }
          .price { font-size: 16px; font-weight: bold; }
          .promo-price { color: red; font-size: 30px;} /* In đỏ nếu có khuyến mãi hoặc giá thấp hơn basePrice */
          .barcode img { width: 200px; height: auto; }
        </style>
      </head>
      <body>
        <div class="tag-container">
          <h2>${stock.productName}</h2>
          <p><strong></strong> ${stock.colorName}</p>
          <p><strong></strong> ${stock.sizeName}</p>
          ${promotionDetails}
          <p class="price ${priceClass}">
            <strong></strong> ${stock.salePrice.toLocaleString()} VND
          </p>
          <div class="barcode">
            <img src="${encodedData}" alt="Barcode" />
          </div>
        </div>
        <script>
          setTimeout(() => { window.print(); window.close(); }, 500);
        </script>
      </body>
    </html>
    `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    }, 1000);
  }


  printAllTagsInPage() {
    setTimeout(() => {
      const allPrintContents = this.stockList.map((stock, index) => {
        const barcodeElement = this.barcodeElements.toArray()[index];
        if (!barcodeElement || !barcodeElement.nativeElement) {
          console.error(`Barcode element chưa sẵn sàng cho sản phẩm ${stock.productName}.`);
          return '';
        }

        const svgElement = barcodeElement.nativeElement.querySelector('svg');
        if (!svgElement) {
          console.error(`Không tìm thấy mã vạch SVG cho sản phẩm ${stock.productName}.`);
          return '';
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const encodedData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

        // Nếu có promotion thì hiển thị ngày bắt đầu & kết thúc
        const promotionDetails = stock.promotion
          ? `<p class="promotion-date">
            <strong></strong>
            ${new Date(stock.promotion.startDate).toLocaleDateString('vi-VN')}
            - ${new Date(stock.promotion.endDate).toLocaleDateString('vi-VN')}
           </p>`
          : '';
        // Kiểm tra nếu salePrice nhỏ hơn basePrice thì in đỏ
        const isDiscounted = stock.salePrice < stock.basePrice;
        const priceClass = stock.promotion || isDiscounted ? 'promo-price' : '';

        return `
      <div class="tag-container">
        <h2>${stock.productName}</h2>
        <p><strong></strong> ${stock.colorName}</p>
        <p><strong></strong> ${stock.sizeName}</p>
        ${promotionDetails}
        <p class="price ${priceClass}">
          <strong></strong> ${stock.salePrice.toLocaleString()} VND
        </p>
        <div class="barcode">
          <img src="${encodedData}" alt="Barcode" />
        </div>
      </div>
      `;
      }).join('');

      if (!allPrintContents) {
        console.error("Không có dữ liệu để in.");
        return;
      }

      const printWindow = window.open("", "_blank", "width=800,height=1000");
      if (!printWindow) {
        console.error("Cửa sổ in bị chặn!");
        return;
      }

      const printContent = `
    <html>
      <head>
        <title>Print Tags</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f8f8f8; text-align: center; }
          .tag-wrapper {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
          }
          .tag-container {
            width: 48%;
            border: 2px solid black;
            border-radius: 10px;
            padding: 12px;
            background: white;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            page-break-inside: avoid;
          }
          h2 { margin: 5px 0; font-size: 18px; font-weight: bold; }
          p { margin: 5px 0; font-size: 14px; }
          .promotion-date { font-style: italic; color: #555; }
          .price { font-size: 16px; font-weight: bold; }
          .promo-price { color: red; font-size: 30px;} /* In đỏ nếu có khuyến mãi hoặc giá thấp hơn basePrice */
          .barcode img { width: 200px; height: auto; }
          @media print {
            .tag-container {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="tag-wrapper">
          ${allPrintContents}
        </div>
        <script>
          setTimeout(() => { window.print(); window.close(); }, 500);
        </script>
      </body>
    </html>
    `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    }, 1000);
  }



  protected readonly String = String;
}
