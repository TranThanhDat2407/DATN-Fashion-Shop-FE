import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, NgForOf, NgIf} from "@angular/common";
import {CategoryAdminService} from '../../../../../services/admin/CategoryService/category.service';
import {PageResponse} from '../../../../../dto/Response/page-response';
import {CategoryAdmin} from '../../../../../models/Category/CategotyAdmin';
import {CategoryDTO} from '../../../../../dto/CategoryDTO';
import {catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {ApiResponse} from '../../../../../dto/Response/ApiResponse';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductVariantDetailDTO} from '../../../../../models/ProductVariant/product-variant-detailDTO';
import {ProductServiceService} from '../../../../../services/client/ProductService/product-service.service';
import {CategoryParentDTO} from '../../../../../dto/CategoryParentDTO';
import {ToastrService} from 'ngx-toastr';

interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean
  subCategories: Category[];
}

@Component({
  selector: 'app-edit-category-for-product',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    CurrencyPipe
  ],
  templateUrl: './edit-category-for-product.component.html',
  styleUrl: './edit-category-for-product.component.scss'
})
export class EditCategoryForProductComponent implements OnInit{

  productDetail!: ProductVariantDetailDTO | null;
  productId: number | null = null;
  categoryList: CategoryParentDTO[] = [];
  selectCategoryToSet: number | null = null;

  async ngOnInit(): Promise<void> {

    // Lấy `id` từ URL
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.fetchProductDetail();
        this.fetchCategoriesForProduct();
      }
    });


    if (this.isActive === null) {
      this.fetchCategory();
    }
    await this.fetchCategory();
    this.listCategory = await firstValueFrom(this.buildCategoryTree());
    console.log(this.listCategory)

  }

  fetchCategoriesForProduct(): void {
    if (this.productId === null) {
      console.error("Product ID is null, cannot fetch categoris");
      return;
    }

    this.productService.getCategoryForProduct("en", this.productId).subscribe({
      next: (response: ApiResponse<CategoryParentDTO[]>) => {
        if (response.status === 200) {
          this.categoryList = response.data;
          console.log('Category List:', this.categoryList);
        } else {
          console.error('Error fetching categories:', response.message);
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  fetchProductDetail(): void {
    if (this.productId === null) {
      console.error("Product ID is null, cannot fetch product details");
      return;
    }

    this.productService.getProductDertail("en", this.productId, undefined).subscribe({
      next: (response: ApiResponse<ProductVariantDetailDTO>) => {
        if (response.status === 200) {
          this.productDetail = response.data;
          console.log('Product Detail:', this.productDetail);
        } else {
          console.error('Error fetching product detail:', response.message);
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  closeModal() {
    this.router.navigate([`../admin/edit_product/${this.productId}`], { relativeTo: this.router.routerState.root });
  }

  constructor(
    private categoryAdminService: CategoryAdminService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductServiceService,
    private toastService: ToastrService,
  ) {}
  parentId?: any
  categoryChildren: Category[] = [];
  categorySubChildren: Category[] = [];
  categorySubSubChildren: Category[] = [];
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

  listCategory: Category[] = []
  dataPageCategory: PageResponse<CategoryAdmin[]> | null = null
  dataParentCategories: CategoryDTO[] = []

  page: number = 0
  size: number = 7
  nameSearch: string = ''
  parentIdSearch: any = null
  sortBy: string = 'id'
  sortDir: string = 'desc'
  isActive: any = null

  // --------------------------
  // HÀM XỬ LÝ TÍNH NĂNG TÌM KIẾM (TỪNG CUSTOM SELECT)
  // --------------------------
  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  searchParentIdCategory(): void {
    this.parentIdSearch = this.parentId
    this.fetchCategory()

  }

  getCategories(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string, isActive: boolean,
    parentId: number
  ): Observable<PageResponse<CategoryAdmin[]>> {
    return this.categoryAdminService.getCategoriesAdmin(page, size, sortBy, sortDir, name, isActive, parentId).pipe(
      map((response: ApiResponse<PageResponse<CategoryAdmin[]>>) => response.data || null),
      catchError(() => of(null as any))
    )
  }

  getParentCategories(): Observable<CategoryDTO[]> {
    return this.categoryAdminService.getParentCategories().pipe(
      map((response: ApiResponse<CategoryDTO[]>) => response.data || []),
      catchError(() => of([]))
    )
  }

  async fetchCategory(): Promise<void> {

    const callApis = {
      dataCategories: this.getCategories(this.page, this.size, this.sortBy, this.sortDir, this.nameSearch,
        this.isActive, this.parentIdSearch).pipe(catchError(() => of(null))),
      dataParentCategory: this.getParentCategories().pipe(catchError(() => of([])))

    }

    const response = await firstValueFrom(forkJoin(callApis))
    this.dataPageCategory = response.dataCategories
    this.dataParentCategories = response.dataParentCategory

    console.log(" run  fetchCategory")

    // this.dataCategories = response.dataCategories?.content?.flat() || [];

    // console.log("dataPageCategory : " + this.dataCategories[0].updatedBy)

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
    this.searchParentIdCategory()
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
    this.searchParentIdCategory()

  }

  selectCategorySubChild(category: Category): void {
    this.selectedCategorySubChild = category;
    this.isOpenCategorySubChild = false;
    this.searchTextCategorySubChild = '';
    this.getListCategorySubSubChild(category.id);
    this.searchParentIdCategory()

  }

  // --------------------------
  // HÀM XỬ LÝ DANH SÁCH CATEGORY CON
  // --------------------------
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
      this.selectCategoryToSet = categoriesIdChild;
      const selectedCategory = this.categorySubChildren.find(category => category.id === Number(categoriesIdChild));
      this.categorySubSubChildren = selectedCategory ? selectedCategory.subCategories : [];
    }
  }

  getChildCategories(parentId: number): Observable<CategoryDTO[]> {

    return this.categoryAdminService.getSubCategoriesByParentId(parentId).pipe(
      map((response: ApiResponse<CategoryDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
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

  removeCategory(categoryId: number): void {
    if (!this.productId) {
      console.error('Product ID is missing.');
      return;
    }

    this.productService.removeCategoryFromProduct(this.productId, categoryId, 'vi').subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.categoryList = this.categoryList.filter(category => category.id !== categoryId);
          this.toastService.success('Success', 'Category removed successfully.', { timeOut: 1000 });
        } else {
          this.toastService.error('Failed', 'Failed to remove category', { timeOut: 1500 });
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  addCategory(categoryId: number): void {
    if (!this.productId) {
      console.error('Product ID is missing.');
      return;
    }

    this.productService.setCategoryForProduct(this.productId, categoryId, 'vi').subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.toastService.success('Success', 'Category added successfully.', { timeOut: 1000 });
          this.fetchCategoriesForProduct(); // Cập nhật UI
        } else {
          this.toastService.error('Failed', 'Failed to add category', { timeOut: 1500 });
        }
      },
      error: (err) => {
        this.toastService.error('Failed', err, { timeOut: 1500 });
      }
    });
  }

}
