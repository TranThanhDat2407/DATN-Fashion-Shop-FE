import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../button/button.component';
import { LanguagesService } from '../../../../services/LanguagesService/languages.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { LanguageDTO } from '../../../../dto/LanguageDTO';
import { CategoryAdminService } from '../../../../services/admin/CategoryService/category.service';
import { CategoryAdminDTO, TranslationDTO } from '../../../../dto/CategoryAdminDTO';
import { ToastrService } from 'ngx-toastr';
import { CategoryDTO } from '../../../../dto/CategoryDTO';
import { response } from 'express';
import { CategoryEditDTO } from '../../../../dto/CategoryEditDTO';

// Interface Category với thuộc tính image
interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean
  subCategories: Category[];
}

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [HeaderAdminComponent,
    RouterLink, CommonModule, FormsModule,
    ButtonComponent],
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss'] // Đã sửa styleUrl -> styleUrls
})
export class EditCategoryComponent implements OnInit {
  // --------------------------
  // Dữ liệu Category (Fake data)
  // --------------------------
  listCategory: Category[] = []
  dataEditCategory: CategoryEditDTO | null = null;
  categoryId: any | null = null
  dataParentCategories: CategoryDTO[] = []
  isActive: boolean = true
  // --------------------------
  // Biến định danh & danh sách con
  // --------------------------
  id!: number;

  parentId?: any
  categoryChildren: Category[] = [];
  categorySubChildren: Category[] = [];
  categorySubSubChildren: Category[] = [];

  // --------------------------
  // Ngôn ngữ & Translation
  // --------------------------
  dataLanguages: LanguageDTO[] = [];
  dataLanguagesEdit: TranslationDTO[] = [];

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
  isEditOpenCategoryChild: boolean = false;
  isOpenCategoryChild: boolean = false;
  searchTextCategoryChild: string = '';
  selectedCategoryChild: Category | null = null;

  // --------------------------
  // Custom select: Category Sub Child
  // --------------------------
  isEditOpenCategorySubChild: boolean = false;
  isOpenCategorySubChild: boolean = false;
  searchTextCategorySubChild: string = '';
  selectedCategorySubChild: Category | null = null;

  // --------------------------
  // File upload
  // --------------------------
  imageUrl: string | ArrayBuffer | null =
    'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg';
  selectedFile: File | null = null;

  // --------------------------
  // Category Admin & New Category
  // --------------------------
  categoryNew: CategoryAdminDTO = {
    parentId: 0,
    translations: []
  };

  // --------------------------
  // CONSTRUCTOR & NGONINIT
  // --------------------------
  constructor(
    private route: ActivatedRoute,
    private languagesSrevice: LanguagesService,
    private categoryAdminService: CategoryAdminService,
    private toastService: ToastrService,
    private routerActive: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.getIdFromRouter();

    // Chờ danh mục được tải xong
    await this.fetchCategory();
    this.listCategory = await firstValueFrom(this.buildCategoryTree());

    if (this.listCategory.length > 0) {
      this.loadDataSelect()
    }


  }



  getIdFromRouter(): void {
    this.routerActive.params.subscribe(params => {
      this.categoryId = Number(params['id']) || null;
    })
    console.log('categoryId ' + this.categoryId)
  }

  // --------------------------
  // HÀM XỬ LÝ NGÔN NGỮ & TRANSLATION
  // --------------------------
  getTranslationByCode(code: string): TranslationDTO {
    const translation = this.translations.find(item => item.languageCode === code);
    return translation ? translation : { languageCode: code, name: '' };
  }
  getLanguages(): Observable<LanguageDTO[]> {
    return this.languagesSrevice.getLanguages().pipe(
      map((response: ApiResponse<LanguageDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  async fetchCategory(): Promise<void> {
    const callApis = {
      dataLanguages: this.getLanguages().pipe(catchError(() => of([]))),
      dataParentCategory: this.getParentCategories().pipe(catchError(() => of([]))),
      dataEditCategory: this.getCategoryEditById(this.categoryId).pipe(catchError(() => of(null)))
    };

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataLanguages = response.dataLanguages;
    this.dataEditCategory = response.dataEditCategory
    // console.log("dataEditCategory : " + this.dataEditCategory?.imageUrl)

    this.buildCategoryTree()





    if (this.categoryId !== null) {
      this.parentId = this.dataEditCategory?.parentId
      //@ts-ignore
      this.isActive = this.dataEditCategory?.isActive
      this.imageUrl = 'http://localhost:8080/uploads/images/categories/' + this.dataEditCategory?.imageUrl
      this.translations = (response.dataEditCategory?.translations ?? []).map(lang => ({
        languageCode: lang.languageCode,
        name: lang.name
      }));

    }





    this.dataParentCategories = response.dataParentCategory || [];
    this.dataEditCategory = response.dataEditCategory || null;

    // if (this.dataLanguages.length > 0) {
    //   this.initializeTranslations();
    // } else {
    //   console.log('Không có dữ liệu ngôn ngữ');
    // }
  }

  async getDataParentCategory(cateChildId: number): Promise<CategoryDTO | null> {
    try {
      const parentCategory = await firstValueFrom(this.getCategoryParentIdByCategoryChildId(cateChildId));

      if (parentCategory) {
        return parentCategory;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi lấy category cha:', error);
      return null;
    }
  }
  async getDataCategoryById(categoryId: number): Promise<CategoryDTO | null> {
    try {
      const category = await firstValueFrom(this.getCategoryById(categoryId));

      if (category) {
        return category;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi lấy category :', error);
      return null;
    }
  }

  async loadDataSelect(): Promise<void> {
    if (this.categoryId !== null) {



      const category = await this.getDataParentCategory(this.categoryId);
      if (category !== null && category.id !== undefined) {
        // category chắc chắn là cate 2 or 3
        const categoryN = await this.getDataParentCategory(category.id);

        if (categoryN !== null && categoryN.id !== undefined) {
          this.isEditOpenCategorySubChild = true
          this.isEditOpenCategoryChild = true


          const categoryParent = await this.getDataCategoryById(categoryN.id)
          console.log("Đây là category cấp cao nhất." + categoryN.id);
          const parent: Category = {
            id: categoryParent?.id ?? 0,
            name: categoryParent?.name ?? '',
            image: categoryParent?.imageUrl,
            isActive: categoryParent?.isActive ?? true,
            subCategories: []
          };
          this.selectCategoryParent(parent)




          const categoryChild = await this.getDataParentCategory(this.categoryId)
          console.log("Đây là category cấp 2 : " + categoryChild?.id);
          const child: Category = {
            id: categoryChild?.id ?? 0,
            name: categoryChild?.name ?? '',
            image: categoryChild?.imageUrl,
            isActive: categoryChild?.isActive ?? true,
            subCategories: []
          };
          this.selectCategoryChild(child)



          const categorySubChild = await this.getDataCategoryById(this.categoryId)
          console.log("Đây là category cấp 3 : " + categorySubChild?.id);
          const subChild: Category = {
            id: categorySubChild?.id ?? 0,
            name: categorySubChild?.name ?? '',
            image: categorySubChild?.imageUrl,
            isActive: categorySubChild?.isActive ?? true,
            subCategories: []
          };
          this.selectCategorySubChild(subChild)
          // cate 3
        } else {


          this.isEditOpenCategoryChild = true
          const categoryParent = await this.getDataCategoryById(category.id)
          console.log("Đây là category cấp cao nhất." + category.id);

          const parent: Category = {
            id: categoryParent?.id ?? 0,
            name: categoryParent?.name ?? '',
            image: categoryParent?.imageUrl,
            isActive: categoryParent?.isActive ?? true,
            subCategories: []
          };
          this.selectCategoryParent(parent)


          const categoryChild = await this.getDataCategoryById(this.categoryId)
          console.log("Đây là category cấp 2 : " + categoryChild?.id);
          const child: Category = {
            id: categoryChild?.id ?? 0,
            name: categoryChild?.name ?? '',
            image: categoryChild?.imageUrl,
            isActive: categoryChild?.isActive ?? true,
            subCategories: []
          };
          this.selectCategoryChild(child)
          // cate 2
        }
      } else {
        // category là thằng category bự nhất
        const categoryParent = await this.getDataCategoryById(this.categoryId)
        console.log("Đây là category cấp cao nhất." + categoryParent?.id);

        const parent: Category = {
          id: categoryParent?.id ?? 0,
          name: categoryParent?.name ?? '',
          image: categoryParent?.imageUrl,
          isActive: categoryParent?.isActive ?? true,
          subCategories: []
        };
        this.selectCategoryParent(parent)
      }




    } else {
      console.log("this.categoryId :" + this.categoryId)

      this.translations = (this.dataLanguages ?? []).map(lang => ({
        languageCode: lang.code,
        name: ''
      }));
      this.initializeTranslations();

    }
  }


  getCategoryById(categoryId: number): Observable<CategoryDTO | null> {
    return this.categoryAdminService.getCategoryById(categoryId).pipe(
      map((response: ApiResponse<CategoryDTO>) => response.data || null),
      catchError(() => of(null))
    )
  }

  getCategoryParentIdByCategoryChildId(cateChildId: number): Observable<CategoryDTO | null> {
    return this.categoryAdminService.getCategoryParentIdByCategoryChildId(cateChildId).pipe(
      map((response: ApiResponse<CategoryDTO>) => response.data || null),
      catchError(() => of(null))
    )
  }

  getCategoryEditById(categoryId: number): Observable<CategoryEditDTO | null> {
    if (categoryId === null || categoryId === undefined) {
      return of(null); //  
    }

    return this.categoryAdminService.getCategoryEditById(categoryId).pipe(
      map((response: ApiResponse<CategoryEditDTO>) => response.data || null),
      catchError(() => of(null))
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

  getParentCategories(): Observable<CategoryDTO[]> {
    return this.categoryAdminService.getParentCategories().pipe(
      map((response: ApiResponse<CategoryDTO[]>) => response.data || []),
      catchError(() => of([]))
    )
  }
  getChildCategories(parentId: number): Observable<CategoryDTO[]> {

    return this.categoryAdminService.getSubCategoriesByParentId(parentId).pipe(
      map((response: ApiResponse<CategoryDTO[]>) => response.data || []),
      catchError(() => of([]))
    );
  }

  initializeTranslations(): void {
    this.translations = this.dataLanguages.map(lang => ({
      languageCode: lang.code,
      name: ''
    }));
  }

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
  }

  selectCategorySubChild(category: Category): void {
    this.selectedCategorySubChild = category;
    this.isOpenCategorySubChild = false;
    this.searchTextCategorySubChild = '';
    this.getListCategorySubSubChild(category.id);
  }


  // --------------------------
  // HÀM XỬ LÝ DANH SÁCH CATEGORY CON
  // --------------------------
  isFirstLoadChild = true; // Biến kiểm soát lần chạy đầu tiên
  getListCategoryChild(categoriesIdChild: number | undefined): Category[] {
    if (categoriesIdChild !== undefined) {
      if (this.categoryId === null) {
        this.isFirstLoadChild = false;
      }

      if (!this.isFirstLoadChild) {
        this.parentId = categoriesIdChild;
      } else {
        console.log("Bỏ qua lần chạy đầu tiên (getListCategoryChild)");
        this.isFirstLoadChild = false; // Đánh dấu lần chạy đầu tiên đã hoàn thành
      }

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
  isFirstLoadSubChild = true; // Biến kiểm soát lần chạy đầu tiên
  getListCategorySubChild(categoriesIdChild: number | undefined): Category[] {
    if (categoriesIdChild !== undefined) {
      if (this.categoryId === null) {
        this.isFirstLoadSubChild = false;
      }
      if (!this.isFirstLoadSubChild) {
        this.parentId = categoriesIdChild;
      } else {
        console.log("Bỏ qua lần chạy đầu tiên (getListCategoryChild)");
        this.isFirstLoadSubChild = false; // Đánh dấu lần chạy đầu tiên đã hoàn thành
      }
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
  isFirstLoadSubSubChild = true; // Biến kiểm soát lần chạy đầu tiên
  getListCategorySubSubChild(categoriesIdChild: number | undefined): void {
    if (categoriesIdChild !== undefined) {
      if (this.categoryId === null) {
        this.isFirstLoadSubSubChild = false;
      }
      if (!this.isFirstLoadSubSubChild) {
        this.parentId = categoriesIdChild;
      } else {
        console.log("Bỏ qua lần chạy đầu tiên (getListCategoryChild)");
        this.isFirstLoadSubSubChild = false; // Đánh dấu lần chạy đầu tiên đã hoàn thành
      }
      console.log("categorySubChildren: " + this.categorySubChildren);
      const selectedCategory = this.categorySubChildren.find(category => category.id === Number(categoriesIdChild));
      this.categorySubSubChildren = selectedCategory ? selectedCategory.subCategories : [];
    }
  }


  // --------------------------
  // HÀM UPLOAD ẢNH
  // --------------------------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];


      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // --------------------------
  // HÀM TẠO CATEGORY MỚI
  // --------------------------
  createCategoryNew = (): void => {

    if (!this.translations || this.translations.length === 0) {
      this.toastService.error('Vui lòng thêm ít nhất một translation!', "Error", { timeOut: 3000 });
      return;
    }
    for (const translation of this.translations) {
      if (!translation.languageCode || !translation.name) {
        this.toastService.error('Mỗi translation phải có đầy đủ languageCode và name!', "Error", { timeOut: 3000 });
        return;
      }
    }

    if (!this.parentId) {
      // this.toastService.error('Vui lòng thêm Parent ID!', "Error", { timeOut: 3000 });
      this.parentId === ''

    }

    const sampleCategory: CategoryAdminDTO = {
      parentId: this.parentId,
      translations: this.translations
    };

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(sampleCategory)], { type: 'application/json' }));

    if (!this.selectedFile) {
      this.toastService.error('Vui lòng chọn một file ảnh!', "Error", { timeOut: 3000 });
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(this.selectedFile.type)) {
      this.toastService.error('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)', "Error", { timeOut: 3000 });
      return;
    }
    if (this.selectedFile.size > maxSize) {
      this.toastService.error('Dung lượng ảnh không được vượt quá 5MB!', "Error", { timeOut: 3000 });
      return;
    }


    formData.append('imageFile', this.selectedFile, this.selectedFile.name);

    this.categoryAdminService.createCategory(formData).subscribe({
      next: response => {
        this.toastService.success('Success', 'Category created successfully!', { timeOut: 3000 });
        this.resetForm()
      },
      error: error => {
        this.toastService.error('Error', 'There was an error creating the category.', { timeOut: 3000 });
        console.log(error);
      }
    });
  }

  updateCategoryNew = (): void => {
    // Kiểm tra translations có tồn tại không
    if (!this.translations || this.translations.length === 0) {
      this.toastService.error('Vui lòng thêm ít nhất một translation!', "Error", { timeOut: 3000 });
      return;
    }

    // Kiểm tra từng translation
    for (const translation of this.translations) {
      if (!translation.languageCode || !translation.name) {
        this.toastService.error('Mỗi translation phải có đầy đủ languageCode và name!', "Error", { timeOut: 3000 });
        return;
      }
    }

    if (!this.parentId) {
      this.parentId = '';
    }

    const category: CategoryAdminDTO = {
      parentId: this.parentId,
      translations: this.translations
    };

    console.log(`category : `, category);

    // Gửi request đến service (nếu có file mới thì truyền vào, nếu không thì chỉ gửi JSON)
    this.categoryAdminService.updateCategory(this.categoryId, category, this.selectedFile ?? undefined).subscribe({
      next: response => {
        this.toastService.success('Success', 'Category updated successfully!', { timeOut: 3000 });
        this.resetForm();
      },
      error: error => {
        this.toastService.error('Error', 'Có lỗi xảy ra khi cập nhật danh mục.', { timeOut: 3000 });
        console.error(error);
      }
    });
  };

  changeActive(isActive: boolean): void {
    // console.log('Category ID:', item.id);
    if (this.categoryId !== null) {
      const newStatus = isActive; // Đảo trạng thái
      this.categoryAdminService.changeActive(this.categoryId, newStatus).subscribe({
        next: (response) => {
          this.toastService.success('Success', 'Category change isActive successfully!', { timeOut: 3000 });
          isActive = newStatus; // Cập nhật trạng thái trên giao diện
        },
        error: (error) => {
          this.toastService.error('Error', 'There was an error deleting the category.', { timeOut: 3000 });

        }
      });
    };

  }

  async resetForm(): Promise<void> {
    this.categoryNew = {
      parentId: 0,
      translations: []
    };
    this.dataLanguages.map(lang => ({
      languageCode: lang.code,
      name: ''
    }));

    // Nếu có các giá trị khác cần reset, bạn có thể reset thêm ở đây, ví dụ:
    this.selectedFile = null;
    this.imageUrl = 'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg';
    this.fetchCategory()
    this.selectedCategoryParent = null;
    this.selectedCategoryChild = null;
    this.selectedCategorySubChild = null;
    this.categoryChildren = [];
    this.categorySubChildren = [];
    this.categorySubSubChildren = [];
    this.listCategory = await firstValueFrom(this.buildCategoryTree());



  }


}
