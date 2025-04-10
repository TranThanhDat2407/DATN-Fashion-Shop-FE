import { CommonModule, NgClass } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import {Router, RouterLink} from '@angular/router';
import {NavigationService} from '../../../services/Navigation/navigation.service';
import {TranslatePipe} from '@ngx-translate/core';
import {CategoryDTO} from '../../../dto/CategoryDTO';
import {CategoryService} from '../../../services/client/CategoryService/category.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap
} from 'rxjs';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ProductServiceService} from '../../../services/client/ProductService/product-service.service';
import {ProductSuggestDTO} from '../../../dto/ProductSuggestDTO';
import {FormsModule} from '@angular/forms';
import {CategoryParentDTO} from '../../../dto/CategoryParentDTO';
import {ApiResponse} from '../../../dto/Response/ApiResponse';

@Component({
  selector: 'app-nav-bottom',
  standalone: true,
  imports: [NgClass,
    CommonModule,
    HeaderComponent,
    RouterLink, TranslatePipe, FormsModule],
  templateUrl: './nav-bottom.component.html',
  styleUrl: './nav-bottom.component.scss'
})
export class NavBottomComponent implements OnInit{
  currentLang: string = 'vi'; // Ngôn ngữ mặc định
  currentCurrency: string = 'vnd'; // Tiền tệ mặc định
  categories$: Observable<CategoryDTO[]> = of([]);
  categoriesChid: CategoryDTO[] = [];
  selectedCategory!: Observable<CategoryDTO>;
  apiError: any;
  isSearchActive: boolean = false;

  constructor(private router: Router,
              private navigationService: NavigationService,
              private categoryService: CategoryService,
              private sanitizer: DomSanitizer,
              private productService: ProductServiceService
              ) {
    // Lắng nghe giá trị ngôn ngữ và tiền tệ từ NavigationService
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });

    // Subscribe để nhận giá trị từ service
    this.navigationService.isSearchActive$.subscribe((value) => {
      this.isSearchActive = value;
    });
  }

  toggleSearch(): void {
    this.navigationService.toggleSearchActive();
  }


  currentLevel: number = 2;



  onCategoryChildClick( parentId: number): void {
    // Lấy ngôn ngữ hiện tại
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    // lấy category được click
    this.selectedCategory = this.categoryService.getCategory(this.currentLang, parentId);

    // lấy category theo ngôn ngữ và parentId
    this.categoryService.getCategories(this.currentLang, parentId).subscribe({
      next: (response) => {
        this.categoriesChid = response.data;
        this.apiError = response.errors;
      },
      error: (err) => {
        console.log('Http Error: ',err);
        console.log('Lỗi: ',this.apiError);
      }
    })
    this.currentLevel = 3; // Chuyển sang tầng 3
  }

// Hàm quay lại tầng 2
  goBack(): void {
    this.currentLevel = 2; // Quay lại tầng 2
  }

  getCategoryImage(fileName: string): string {
    return this.categoryService.getCategoryImage(fileName)
  }

  toProduct(categoryId: number): void {
    this.navigationService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.navigationService.currentCurrency$.subscribe((currency) => {
      this.currentCurrency = currency;
    });
    this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/product`], {
      queryParams: {
        categoryId: categoryId,
        isActive: true,
        page: 0,
        size: 10,
        sortBy: 'id',
        sortDir: 'asc'
      }
    });
  }


  ngOnInit(): void {
    this.categories$ = this.categoryService.categories$; // Subscribe vào Observable từ service
  }

  searchQuery: string = '';
  searchResults: ProductSuggestDTO[] = [];

  private searchSubscription!: Subscription;

  closeSearch(): void {
    this.isSearchActive = false;
    this.navigationService.toggleSearchActive();
    this.searchQuery = '';
    this.searchResults = [];
  }

  getCategoryParent(lang: string, productId: number | 0): Observable<CategoryParentDTO[]> {
    return this.productService.getCategoryParent(lang, productId)
      .pipe(
        map((response: ApiResponse<CategoryParentDTO[]>) => response.data || []),
        catchError(() => of([]))
      )
  }

  onSearchInput(event: any) {
    const query = event.target.value.trim();
    this.searchQuery = query;

    if (query.length > 0) {
      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe();
      }

      this.searchSubscription = this.productService.suggestProducts(query, this.currentLang).pipe(
        switchMap((products: ProductSuggestDTO[]) => {
          if (products.length === 0) {
            return of([]);
          }

          // Lọc các sản phẩm có ID hợp lệ
          const validProducts = products.filter(product => product.id !== undefined);

          // Gọi API lấy danh mục cha của từng sản phẩm
          const categoryRequests = validProducts.map(product =>
            this.getCategoryParent(this.currentLang, product.id!)
          );

          return forkJoin(categoryRequests).pipe(
            map((categoriesList) => {
              return products.map((product, index) => ({
                ...product,
                categoryParent: product.id !== undefined
                  ? categoriesList[validProducts.findIndex(p => p.id === product.id)] || []
                  : []
              }));
            })
          );
        }),
        catchError((error) => {
          console.error('Lỗi khi tìm kiếm sản phẩm:', error);
          return of([]);
        })
      ).subscribe({
        next: (mergedResults) => {
          this.searchResults = mergedResults;
          console.log('✅ searchResults cập nhật:', this.searchResults); // Debug
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  onSearchEnter(): void {
    if (this.searchQuery.trim()) {
      this.navigationService.currentLang$.subscribe((lang) => {
        this.currentLang = lang;
      });

      this.navigationService.currentCurrency$.subscribe((currency) => {
        this.currentCurrency = currency;
      });

      this.router.navigate([`/client/${this.currentCurrency}/${this.currentLang}/product`], {
        queryParams: {
          name: this.searchQuery.trim(),
          isActive: true,
          page: 0,
          size: 10,
          sortBy: 'id',
          sortDir: 'asc'
        }
      });
    }
  }


}
