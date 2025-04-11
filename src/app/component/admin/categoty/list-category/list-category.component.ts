import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { TableComponent } from '../../table/table.component';
import { PageResponse } from '../../../../dto/Response/page-response';

import { CategoryAdminService } from '../../../../services/admin/CategoryService/category.service';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { CommonModule } from '@angular/common';
import { CategoryAdminDTO } from '../../../../dto/CategoryAdminDTO';
import { ToastrService } from 'ngx-toastr';
import { CategoryAdmin } from '../../../../models/Category/CategotyAdmin';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { CategoryDTO } from '../../../../dto/CategoryDTO';
import { LanguageDTO } from '../../../../dto/LanguageDTO';

export interface TableDataModel {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
  parentsID: number;
  parentsName: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean
  subCategories: Category[];
}
@Component({
  selector: 'app-list-category',
  standalone: true,

  imports: [HeaderAdminComponent, TableComponent, CommonModule, FormsModule, MatDialogModule, DialogComponent],
  templateUrl: './list-category.component.html',
  styleUrl: './list-category.component.scss'
})


export class ListCategoryComponent implements OnInit {
  headers: string[] = ['id', 'name', 'imageUrl', 'isActive', 'parentId', 'parentName', 'createdAt', 'updatedAt', 'createdBy',
    'updatedBy', 'button'];


  page: number = 0
  size: number = 10
  nameSearch: string = ''
  parentIdSearch: any = null
  sortBy: string = 'id'
  sortDir: string = 'desc'
  isActive: any = null

  debounceTimerName: any;
  debounceTimerParentId: any;
  dataPageCategory: PageResponse<CategoryAdmin[]> | null = null
  dataCategories: CategoryAdmin[] = [];


  // --------------------------
  // Dữ liệu Category (Fake data)
  // --------------------------
  listCategory: Category[] = []
  dataParentCategories: CategoryDTO[] = []

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



  // --------------------------
  // Category Admin & New Category
  // --------------------------
  categoryNew: CategoryAdminDTO = {
    parentId: 0,
    translations: []
  };




  constructor(
    private categoryAdminService: CategoryAdminService,
    private toastService: ToastrService,
    private diaLog: MatDialog
  ) {

  }

  async ngOnInit(): Promise<void> {
    if (this.isActive === null) {
      this.fetchCategory()

    }
    await this.fetchCategory();
    this.listCategory = await firstValueFrom(this.buildCategoryTree());
    console.log(this.listCategory)

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


  selectItem(item: any): void {
    this.selectedItem = item;
    this.isOpen = false;
    this.searchText = '';
    console.log(item.id);
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
      const selectedCategory = this.categorySubChildren.find(category => category.id === Number(categoriesIdChild));
      this.categorySubSubChildren = selectedCategory ? selectedCategory.subCategories : [];
    }
  }








  onItemsPerPageChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.fetchCategory(); // Gọi lại API với size mới
  }


  onPageChange(newPage: number): void {
    this.page = newPage;  // Cập nhật giá trị page
    this.fetchCategory(); // Gọi lại API với trang mới
  }

  onCreateAtChange() {
    this.fetchCategory();

  }
  onSortDirChange() {
    this.fetchCategory();

  }
  onIsActiveChange(): void {
    this.fetchCategory()
    console.log("Selected isActive value:", this.isActive);
  }

  async resetFiter(): Promise<void> {

    this.isActive = null;
    this.sortBy = 'id'
    this.sortDir = 'desc'
    this.nameSearch = ''
    this.parentIdSearch = ''
    this.parentId = ''
    this.selectedCategoryParent = null;
    this.selectedCategoryChild = null;
    this.selectedCategorySubChild = null;
    this.categoryChildren = [];
    this.categorySubChildren = [];
    this.categorySubSubChildren = [];
    this.listCategory = await firstValueFrom(this.buildCategoryTree());


    this.fetchCategory();
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
  onNameChange(value: string): void {
    // Xóa timer cũ nếu có
    if (this.debounceTimerName) {
      clearTimeout(this.debounceTimerName);
    }
    // Đặt timer mới chờ 1s
    this.debounceTimerName = setTimeout(() => {
      this.searchNameCategory(value);
    }, 1000);
  }
  // onParentIdChange(value: string): void {
  //   // Xóa timer cũ nếu có
  //   if (this.debounceTimerParentId) {
  //     clearTimeout(this.debounceTimerParentId);
  //   }
  //   // Đặt timer mới chờ 1s
  //   this.debounceTimerParentId = setTimeout(() => {
  //     this.searchParentIdCategory(value);
  //   }, 1000);
  // }
  searchParentIdCategory(): void {
    this.parentIdSearch = this.parentId
    this.fetchCategory()

  }
  searchNameCategory(value: string): void {
    this.nameSearch = value
    this.fetchCategory()
    console.log(" run  searchNameCategory")
    console.log(this.nameSearch)
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

  clickNe(id: number) {
    console.log('Selected ID:', id);
  }




  deleteCategory = (id: number): void => {
    const dialogRef = this.diaLog.open(DialogComponent, {
      data: { message: 'Are you sure you want to delete Category?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`result: ${result}`);
      if (result === true) {
        this.categoryAdminService.deleteCategory(id).subscribe({
          next: response => {
            this.toastService.success('Success', 'Category Deleted successfully!', { timeOut: 3000 });
            this.fetchCategory();
          },
          error: error => {
            this.toastService.error('Error', 'There was an error deleting the category.', { timeOut: 3000 });
            console.log(error);
          }
        });
      }
    });
  };
  checkedItems: number[] = [];

  changeActive = (item: any): void => {
    console.log('Category ID:', item.id);

    const newStatus = !item.isActive;
    this.categoryAdminService.changeActive(item.id, newStatus).subscribe({
      next: (response) => {
        this.toastService.success('Success', 'Category change isActive successfully!', { timeOut: 3000 });
        item.isActive = newStatus;
      },
      error: (error) => {
        this.toastService.error('Error', 'There was an error deleting the category.', { timeOut: 3000 });
      }
    });
  };

  toggleCheckbox = (item: any): void => {
    item.checked = !item.checked;

    if (item.checked) {
      if (!this.checkedItems.includes(item.id)) {
        this.checkedItems.push(item.id);
      }
    } else {
      this.checkedItems = this.checkedItems.filter(id => id !== item.id);
    }
    console.log('After toggle:', this.checkedItems);
  }
  deleteCategories = async (): Promise<void> => {
    if (this.checkedItems.length === 0) {
      this.toastService.error('No items selected to delete.', 'Error', { timeOut: 2000 });

      return;
    }

    // Mở dialog xác nhận và chờ kết quả
    const result = await firstValueFrom(
      this.diaLog.open(DialogComponent, {
        width: '400px',
        data: { message: 'Are you sure you want to delete Category?' }
      }).afterClosed()
    );

    if (result === true) {
      // Xóa các mục theo thứ tự, đợi API xóa từng mục hoàn thành
      for (const id of this.checkedItems) {
        try {
          await firstValueFrom(this.categoryAdminService.deleteCategory(id));
          console.log(`Deleted category with id ${id}`);
          this.toastService.success('Success', 'Category deleted successfully!', { timeOut: 1000 });
        } catch (error) {
          console.error(`Error deleting category with id ${id}`, error);
          this.toastService.error('Error', 'There was an error deleting the category.', { timeOut: 1000 });
        }
      }
    } else {
      console.log('User canceled deletion.');
    }

    // Sau khi xóa xong (hoặc hủy), reset mảng và làm mới danh sách
    this.checkedItems = [];
    this.fetchCategory();
  };




  createCategoryNew() {
    const sampleCategory: CategoryAdminDTO = {
      parentId: 1,
      translations: [
        { languageCode: 'vi', name: 'Áo' },
        { languageCode: 'en', name: 'T-SHIRTS, SWEAT & FLEECE MANH 1' },
        { languageCode: 'jp', name: 'アウターウェア' }
      ]
    };

    // Tạo Blob và File cho hình ảnh
    const sampleFileContent = new Blob(['Sample image content'], { type: 'image/png' });
    const selectedFile = new File([sampleFileContent], "sample.png", { type: 'image/png' });

    // Tạo FormData để gửi cả JSON và file
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(sampleCategory)], { type: 'application/json' }));
    formData.append('imageFile', selectedFile, selectedFile.name);

    // Gọi API
    this.categoryAdminService.createCategory(formData).subscribe({
      next: response => {
        this.toastService.success('Success', 'Category created successfully!', { timeOut: 3000 });
      },
      error: error => {
        this.toastService.error('Error', 'There was an error creating the category.', { timeOut: 3000 });
        console.log(error);
      }
    });
  }





}

