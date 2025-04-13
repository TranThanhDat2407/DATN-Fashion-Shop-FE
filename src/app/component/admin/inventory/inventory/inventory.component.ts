import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { StoreHeaderComponent } from '../../../staff/store-header/store-header.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryTransferResponse } from '../../../../dto/inventory-transfer/InventoryTransferResponse';
import { InventoryTransferService } from '../../../../services/inventory-transfer/inventory-transfer.service';

import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { PageResponse } from '../../../../dto/Response/page-response';
import { Store } from '../../../../models/Store/Store';

import { response } from 'express';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { ListStoreStockDTO } from '../../../../dto/ListStoreStockDTO';
import { CategoryDTO } from '../../../../dto/CategoryDTO';
import { LanguageDTO } from '../../../../dto/LanguageDTO';
import { TranslationDTO } from '../../../../dto/CategoryAdminDTO';
import { error } from 'console';
import { StoreService } from '../../../../services/client/store/store.service';
import { CategoryAdminService } from '../../../../services/admin/CategoryService/category.service';
import { LanguagesService } from '../../../../services/LanguagesService/languages.service';
import { InventoryService } from '../../../../services/admin/InventoryService/inventory.service';
import { DetailMediaDTO } from '../../../../dto/DetailMediaDTO';
import { MediaInfoDTO } from '../../../../dto/MediaInfoDTO';
import { ColorDTO } from '../../../../models/colorDTO';
import { ProductVariantDTO } from '../../../../dto/ProductVariantDTO';
import { ImageDetailService } from '../../../../services/client/ImageDetailService/image-detail.service';
import { ProductServiceService } from '../../../../services/client/ProductService/product-service.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from "../../button/button.component";
import { DialogComponent } from '../../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';


interface ProductVariantModel {
  sortOrder: number;
  modelHeight: number;
  colorValueId: number;
  productVariantIds: number[];
}
interface Category {
  id: number;
  name: string;
  image?: string;
  isActive: boolean
  subCategories: Category[];
}
@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxBarcode6Module, HeaderAdminComponent, NgOptimizedImage, RouterLink, ButtonComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  inventoryId: number = 0
  dataMessage: string = ''

  selectedStore: number = 0;

  storeId: number = 2;
  storeIdForWarehouse: number = 0;

  name?: string
  city?: string
  page: number = 0
  size: number = 10
  userLat?: number
  userLon?: number
  dataPageStore: PageResponse<Store[]> | null = null
  dataStore: Store[] = []


  stockList: ListStoreStockDTO[] = [];
  pageNo = 0;
  pageSize = 10;
  totalPages = 0;

  languageCode: string = 'vi';
  productName?: string;
  categoryId?: number;
  sortBy: string = 'productVariant.product.id';
  sortDir: string = 'asc';

  // category
  listCategory: Category[] = []
  dataParentCategories: CategoryDTO[] = []
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

  dataPageInventoryForWarehouse: PageResponse<ListStoreStockDTO[]> | null = null
  dataInventoryForWarehouse: ListStoreStockDTO[] = []

  dataPageInventoryForWarehouseTransfer: PageResponse<ListStoreStockDTO[]> | null = null
  dataInventoryForWarehouseTransfer: ListStoreStockDTO[] = []
  dataAllInventoryForWarehouseTransfer: ListStoreStockDTO[] = []

  warehouseId: number = 1
  nameSearchWarehouse: string = ''
  categoryIdWarehouse?: number
  pageWarehouse?: number
  sizeWarehouse?: number
  sortByWarehouse: string = 'id'
  sortDirWarehouse?: string


  mediaId!: number;
  productId!: number;
  checkedItem: number[] = [];

  dataDetailMedia: DetailMediaDTO[] = [];
  dataMediaInfo: MediaInfoDTO | null = null;
  dataColors: ColorDTO[] = [];
  selectedColorId!: number;
  colorId?: number;
  dataProductVariantPage: PageResponse<ProductVariantDTO[]> | null = null
  dataProductVariant: ProductVariantDTO[] = []
  qtyInStock: number = 0

  currentPageProductVar: number = 0;
  pageSizeProductVar: number = 15;
  totalPageProductVar: number = 0;
  nameSearchProductVar: string = ''


  warehouseIdTranfer: number = 1
  categoryIdWarehouseTranfer?: number
  pageWarehouseTranfer?: number
  sizeWarehouseTranfer?: number
  sortByWarehouseTranfer: string = 'id'
  sortDirWarehouseTranfer?: string


  currentPageWarehouseTransfer: number = 0;
  pageSizeWarehouseTransfer: number = 15;
  totalPageWarehouseTransfer: number = 0;
  nameSearchWarehouseTransfer: string = ''
  pageNoWarehouseTransfer = 0;


  nameSearch: string = ''
  selectedProductVariants: number[] = [];
  newProductVariant: ProductVariantModel = {
    sortOrder: 0,
    modelHeight: 0,
    colorValueId: 0,
    productVariantIds: []
  }


  pageNoWarehouse = 0;
  pageSizeWarehouse = 10;
  totalPagesWarehouse = 0;

  qtyTransfer: number = 1

  selectedWarehouseTransfer: ListStoreStockDTO[] = [];


  constructor(
    private inventoryTransferService: InventoryTransferService,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private categoryAdminService: CategoryAdminService,
    private languagesSrevice: LanguagesService,
    private inventoryService: InventoryService,
    private imageDetailService: ImageDetailService,
    private productService: ProductServiceService,
    private toastService: ToastrService,
    private diaLog: MatDialog,

  ) { }

  async ngOnInit() {
    this.editInventory('tab-4')
    console.log('selectedWarehouseTransfer selectedWarehouseTransfer : ' + this.selectedWarehouseTransfer.length)
    await this.fetchCategory();
    this.listCategory = await firstValueFrom(this.buildCategoryTree());
    this.fetchStockData()
    this.fetchInventoryStore()
  }


  // Thêm các biến mới vào component

  maxDisplayedPagesWarehouse: number = 10; // Số trang tối đa hiển thị
  additionalPagesWarehouse: number = 10; // Số trang thêm vào khi đạt đến giới hạn

  // Hàm thay đổi page size
  onPageSizeChangeWarehouse(): void {
    this.pageNoWarehouse = 0; // Reset về trang đầu tiên khi thay đổi page size
    this.fetchInventoryForWarehouseOnly();
  }

  // Hàm thay đổi trang
  changePageWarehouse(page: number): void {
    if (page >= 0 && page < this.totalPagesWarehouse) {
      this.pageNoWarehouse = page;
      this.fetchInventoryForWarehouseOnly();
    }
  }

  // Các hàm hỗ trợ hiển thị phân trang
  getDisplayedPagesWarehouse(): number[] {
    let startPage: number;
    let endPage: number;

    if (this.totalPagesWarehouse <= this.maxDisplayedPagesWarehouse) {
      // Hiển thị tất cả nếu tổng số trang ít
      startPage = 0;
      endPage = this.totalPagesWarehouse - 1;
    } else {
      // Tính toán các trang cần hiển thị
      if (this.pageNoWarehouse <= this.maxDisplayedPagesWarehouse - 1) {
        startPage = 0;
        endPage = this.maxDisplayedPagesWarehouse - 1;
      } else {
        startPage = this.pageNoWarehouse;
        endPage = Math.min(this.pageNoWarehouse + this.additionalPagesWarehouse - 1, this.totalPagesWarehouse - 1);
      }
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  showFirstPageWarehouse(): boolean {
    return this.getDisplayedPagesWarehouse()[0] > 0;
  }

  showLastPageWarehouse(): boolean {
    return this.getDisplayedPagesWarehouse()[this.getDisplayedPagesWarehouse().length - 1] < this.totalPagesWarehouse - 1;
  }

  showFirstEllipsisWarehouse(): boolean {
    return this.getDisplayedPagesWarehouse()[0] > 1;
  }

  showLastEllipsisWarehouse(): boolean {
    return this.getDisplayedPagesWarehouse()[this.getDisplayedPagesWarehouse().length - 1] < this.totalPagesWarehouse - 2;
  }

  validateTransfer(): boolean {
    for (const item of this.selectedWarehouseTransfer) {
      if (!item.quantityInStock || item.quantityInStock <= 0) {
        this.toastService.warning(`Invalid quantity for product ID: ${item.productVariantId}`, "Warning", { timeOut: 3000 });
        return false;
      }
    }


    if (this.selectedWarehouseTransfer.length === 0) {
      this.toastService.warning("Please select at least one product!", "Warning", { timeOut: 3000 });
      return false;
    }

    if (!this.storeIdForWarehouse) {
      this.toastService.warning("Please select a store!", "Warning", { timeOut: 3000 });
      return false;
    }



    return true;
  }

  resetFormTransfer() {
    this.selectedWarehouseTransfer = []
    this.fetchWarehouseTransferOnly()
    this.dataMessage = ''
    this.storeIdForWarehouse = 0
    this.qtyTransfer = 1
  }
  insertTransfer = async (): Promise<void> => {
    if (!this.validateTransfer()) return;
    try {
      let isValid = true;

      for (const transfer of this.selectedWarehouseTransfer) {
        const stock = this.dataAllInventoryForWarehouseTransfer.find(s => s.productVariantId === transfer.productVariantId);

        if (!stock) {
          this.toastService.warning(`No stock found for product ID: ${transfer.productVariantId}`, "Warning", { timeOut: 5000 });
          isValid = false;
          break;
        }

        if (transfer.quantityInStock > stock.quantityInStock) {
          this.toastService.warning(
            `Quantity for ${stock.colorName} - ${stock.sizeName} in Warehouse not enough || Qty in Warehouse: ${stock.quantityInStock}`,
            "Warning",
            { timeOut: 5000 }
          );
          isValid = false;
          break;
        }
      }
      if (!isValid) return;
      let allSuccess = true;


      const transferItems = this.selectedWarehouseTransfer.map(transfer => ({
        productVariantId: transfer.productVariantId,
        quantity: transfer.quantityInStock
      }));

      const exemplarTransfer = {
        warehouseId: 1,
        storeId: this.storeIdForWarehouse,
        message: this.dataMessage,
        transferItems: transferItems
      };

      try {
        const response = await this.inventoryService.insertInventoryTransfer(exemplarTransfer).toPromise();
        if (!response) {
          allSuccess = false;
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        allSuccess = false;
      }

      if (allSuccess) {
        this.resetFormTransfer();
        this.toastService.success("Transfer Store Successfully!", "Success", { timeOut: 3000 });
      } else {
        this.toastService.error("Some transfers failed!", "Error", { timeOut: 3000 });
      }
    } catch (error) {
      console.error("Lỗi khi chuyển kho:", error);
      this.toastService.error("Transfer Store error!", "Error", { timeOut: 3000 });
    }
  };


  updateQuantity(event: Event, itemTransferSelect: any) {
    const inputElement = event.target as HTMLInputElement;
    itemTransferSelect.quantityInStock = Number(inputElement.value);
  }


  async fetchInventoryStore(): Promise<void> {
    const callApis = {
      dataStore: this.getStore(this.name, this.city, this.page, this.size, this.userLat, this.userLon).pipe(catchError(() => of(null))),
      dataInventoryForWarehouse: this.getInventoryForWarehouse(1, this.nameSearchWarehouse, this.categoryIdWarehouse, this.pageWarehouse, this.sizeWarehouse, this.sortByWarehouse, this.sortDirWarehouse).pipe(catchError(() => of(null))),
      dataInventoryForWarehouseTransfer: this.getInventoryForWarehouse(1, this.nameSearchWarehouseTransfer, this.categoryIdWarehouseTranfer, this.pageWarehouseTranfer, this.sizeWarehouseTranfer, this.sortByWarehouseTranfer, this.sortDirWarehouseTranfer).pipe(catchError(() => of(null))),
      dataProductVariant: this.getProductVariant(this.nameSearchProductVar, this.currentPageProductVar, this.pageSizeProductVar).pipe(catchError(() => of(null)))

    }
    const response = await firstValueFrom(forkJoin(callApis))
    this.dataPageStore = response.dataStore
    this.dataStore = response.dataStore?.content.flat() ?? []

    this.dataPageInventoryForWarehouse = response.dataInventoryForWarehouse
    this.dataInventoryForWarehouse = response.dataInventoryForWarehouse?.content.flat() ?? []
    this.totalPagesWarehouse = response.dataInventoryForWarehouse?.totalPages ?? 0


    this.dataPageInventoryForWarehouseTransfer = response.dataInventoryForWarehouse
    this.dataInventoryForWarehouseTransfer = response.dataInventoryForWarehouse?.content.flat() ?? []

    this.totalPageWarehouseTransfer = response.dataInventoryForWarehouse?.totalPages ?? 0



    this.dataProductVariant = response.dataProductVariant?.content.flat() ?? []
    this.totalPageProductVar = response.dataProductVariant?.totalPages ?? 0;



    this.dataAllInventoryForWarehouseTransfer = await this.fetchAllInventoryForWarehouse();



  }


  async fetchAllInventoryForWarehouse(): Promise<any[]> {
    let allData: any[] = [];
    let currentPage = 0;
    let totalPages = 1; // Giả sử số trang ban đầu là 1

    while (currentPage < totalPages) {
      const response = await firstValueFrom(this.getInventoryForWarehouse(
        1,
        this.nameSearchWarehouse,
        this.categoryIdWarehouse,
        currentPage,
        this.sizeWarehouse,
        this.sortByWarehouse,
        this.sortDirWarehouse
      ).pipe(catchError(() => of(null))));

      if (response && response.content) {
        allData = [...allData, ...response.content]; // Gộp dữ liệu từ từng trang
        totalPages = response.totalPages; // Cập nhật tổng số trang từ API
      } else {
        break; // Nếu không có dữ liệu, thoát vòng lặp
      }

      currentPage++;
    }

    return allData;
  }
  async fetchProductVariantOnly(): Promise<void> {
    const response = await firstValueFrom(
      this.getProductVariant(
        this.nameSearchProductVar,
        this.currentPageProductVar,
        this.pageSizeProductVar
      ).pipe(catchError(() => of(null)))
    );

    this.dataProductVariantPage = response;
    this.dataProductVariant = response?.content?.flat() ?? [];
    this.totalPageProductVar = response?.totalPages ?? 0;

    console.log("dataProductVariant", response);
  }


  async fetchWarehouseTransferOnly(): Promise<void> {
    const response = await firstValueFrom(
      this.getInventoryForWarehouse(
        1, // warehouseId
        this.nameSearchWarehouseTransfer,
        this.categoryIdWarehouseTranfer,
        this.currentPageWarehouseTransfer, // Cập nhật đúng currentPage
        this.sizeWarehouseTranfer,
        this.sortByWarehouseTranfer,
        this.sortDirWarehouseTranfer
      ).pipe(catchError(() => of(null)))
    );

    this.dataPageInventoryForWarehouseTransfer = response;
    this.dataInventoryForWarehouseTransfer = response?.content?.flat() ?? [];
    this.totalPageWarehouseTransfer = response?.totalPages ?? 0;

    console.log("fetchWarehouseTransferOnly", response);
  }
  validateQuantity(item: ListStoreStockDTO): void {
    if (!item.quantityInStock || item.quantityInStock <= 0) {
      item.quantityInStock = 1; // Nếu nhỏ hơn hoặc bằng 0 hoặc không phải số, đặt về 1
    }
  }

  chooseStoreWarehouse() {

    console.log('storeIdForWarehouse : ' + this.storeIdForWarehouse)
  }
  fillQtyInStock(): void {
    this.dataInventoryForWarehouse.forEach(item => {
      console.log(`Item ID: ${item.inventoryId}, Current ID: ${this.inventoryId}`);

      if (item.inventoryId === this.inventoryId) {
        this.qtyInStock = item.quantityInStock
        console.log("Trùng khớp inventoryId", item.quantityInStock);
      } else {
        console.log("Không trùng khớp inventoryId");
      }
    });
  }

  checkProductVarinatId(): void {
    this.selectedProductVariants.forEach(item => {
      const idHad = Number(item);

      const exists = this.dataAllInventoryForWarehouseTransfer.some(
        warehouse => warehouse.productVariantId === idHad
      );
      if (exists) {
        this.toastService.success("Transfer Store Successfully!", "Success", { timeOut: 3000 });
      } else {
        console.log('Không có id:', idHad);
      }
    });

  }


  validationInsert(): boolean {
    if (this.selectedProductVariants.length === 0) {
      this.toastService.error('Product Variant is emty', "Error", { timeOut: 3000 });
      return false;
    }



    if (
      this.qtyInStock === 0 ||
      this.qtyInStock === null ||
      this.qtyInStock === undefined ||
      isNaN(this.qtyInStock)
    ) {
      this.toastService.error('Qty in stock is empty', 'Error', { timeOut: 3000 });
      return false;
    }

    return true;

  }
  insertProductVariantFromWarehouse = async (): Promise<void> => {
    if (!this.validationInsert()) return;

    const duplicatedItems = this.selectedProductVariants.filter(item =>
      this.dataAllInventoryForWarehouseTransfer.some(
        warehouse => warehouse.productVariantId === Number(item)
      )
    );

    if (duplicatedItems.length > 0) {
      const messageLines = duplicatedItems.map(item => {
        const warehouse = this.dataAllInventoryForWarehouseTransfer.find(
          w => w.productVariantId === Number(item)
        );

        if (!warehouse) {
          console.error(`Warehouse for productVariantId ${item} not found.`);
          return `ID ${item}: Warehouse not found!`; // Nếu không tìm thấy warehouse, trả về thông báo lỗi.
        }

        const oldQty = warehouse.quantityInStock || 0; // Đảm bảo luôn có giá trị số
        const newQty = oldQty + this.qtyInStock;
        return `ID ${item}: ${oldQty} + ${this.qtyInStock} = ${newQty}`;
      });

      const dialogRef = this.diaLog.open(DialogComponent, {
        data: {
          message: `The following products are already in stock. Do you want to add more quantity? \n \n${messageLines.join('\n')}\n`,
          confirm: 'YES'
        }
      });

      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) {
        console.log("❌ Hủy thêm do người dùng từ chối.");
        return;
      }
    }

    const insertPromises = this.selectedProductVariants.map(async item => {
      const dataInsertWarehouse = {
        warehouseId: 1,
        productVariantId: Number(item),
        quantityInStock: this.qtyInStock
      };

      try {
        await firstValueFrom(this.inventoryService.insertInventory(dataInsertWarehouse));
      } catch (error) {
        console.error(`❌ Lỗi khi thêm productVariantId ${item}:`, error);
        throw error;
      }
    });

    try {
      await Promise.all(insertPromises);
      this.toastService.success('Add Product Variant Successfully! ', "Success", { timeOut: 3000 });
      this.fetchInventoryForWarehouseOnly();
      this.dataAllInventoryForWarehouseTransfer = await this.fetchAllInventoryForWarehouse();
      this.resetForm();
    } catch (error) {
      this.toastService.error('Lỗi khi thêm vào kho', "Error", { timeOut: 3000 });
    }
  };





  resetRouterLink(tab: string): void {
    this.router.navigate([`/admin/inventory`]);
    this.editInventory(tab)
    this.selectedInventory = null
    this.inventoryId = 0

  }
  goToEditInventory(idInventory: number): void {
    this.inventoryId = idInventory;
    this.fillQtyInStock()
    this.fillDataEdit();
    this.editInventory('tab-3');
  }

  selectedInventory: ListStoreStockDTO | null = null

  fillDataEdit(): void {
    const inventory = this.dataInventoryForWarehouse.find(item => item.inventoryId === this.inventoryId);

    if (inventory) {
      this.selectedInventory = inventory; // Gán dữ liệu để hiển thị
      console.log(this.selectedInventory)
    } else {
      console.warn('Không tìm thấy inventory với ID:', this.inventoryId);
    }
  }




  inputPage: number = 1;
  changePageProductVart(page: number) {
    if (page >= 0 && page < this.totalPageProductVar) {
      this.currentPageProductVar = page;
      this.inputPage = page + 1; // Cập nhật giá trị input
      this.fetchProductVariantOnly()

    }
  }

  goToPage(page: number) {
    const pageIndex = page - 1; // Chuyển đổi thành chỉ mục 0-based
    if (pageIndex >= 0 && pageIndex < this.totalPageProductVar) {
      this.changePageProductVart(pageIndex);
    } else {
      this.inputPage = this.currentPageProductVar + 1; // Reset nếu nhập sai
    }
  }


  inputPageWarehouseTransfer: number = 1;
  changePageWarehouseTransfer(page: number) {
    if (page >= 0 && page < this.totalPageWarehouseTransfer) {
      this.currentPageWarehouseTransfer = page;
      this.inputPageWarehouseTransfer = page + 1; // Cập nhật giá trị input
      this.fetchWarehouseTransferOnly();
    }
  }

  goToPageWarehouseTransfer(page: number) {
    const pageIndex = page - 1; // Chuyển thành chỉ mục 0-based
    if (pageIndex >= 0 && pageIndex < this.totalPageWarehouseTransfer) {
      this.changePageWarehouseTransfer(pageIndex);
    } else {
      this.inputPageWarehouseTransfer = this.currentPageWarehouseTransfer + 1; // Reset nếu nhập sai
    }
  }


  searchWarehouseTranfer(): void {
    console.log(this.nameSearchProductVar)
    this.goToPageWarehouseTransfer(1)
    this.fetchWarehouseTransferOnly()
  }

  searchProductItem(): void {
    this.goToPage(1)
    this.fetchProductVariantOnly()
  }

  getProductVariant(name: string, page: number, size: number): Observable<PageResponse<ProductVariantDTO[]> | null> {
    return this.productService.getProductVariants(name, page, size).pipe(
      map((response: ApiResponse<PageResponse<ProductVariantDTO[]>>) => response.data || null),
      catchError(() => of(null))
    )
  }


  // Thêm các biến mới vào component
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

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
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



  toggleCheckbox(productVariantId: number): void {
    const index = this.selectedProductVariants.indexOf(productVariantId);

    if (index === -1) {
      this.selectedProductVariants.push(productVariantId);
    } else {
      this.selectedProductVariants.splice(index, 1);
    }

    console.log("Danh sách đã chọn:", this.selectedProductVariants);
  }


  toggleSelectedWarehouseTransfer(warehouseTransfer: ListStoreStockDTO): void {
    const index = this.selectedWarehouseTransfer.findIndex(item => item.productVariantId === warehouseTransfer.productVariantId);

    if (index !== -1) {
      this.selectedWarehouseTransfer.splice(index, 1);
    } else {
      this.selectedWarehouseTransfer.push({
        ...warehouseTransfer,
        quantityInStock: 1 // Đặt qty về 1 khi chọn
      });
    }

    // Log danh sách đã chọn
    console.log("Danh sách Warehouse Transfer đã chọn:", this.selectedWarehouseTransfer);
  }

  applyAllQtyWarehouse(): void {
    if (!this.selectedWarehouseTransfer.length) {
      this.toastService.warning("Please choose Product Variant!", "Warning", { timeOut: 3000 });
      return; // Đảm bảo có return nếu danh sách trống
    }

    if (!this.qtyTransfer || this.qtyTransfer == 0) {
      this.toastService.warning("Quantity must be greater than 0!", "Warning", { timeOut: 3000 });
      return; // Đảm bảo có return nếu số lượng không hợp lệ
    }

    this.selectedWarehouseTransfer.forEach(item => item.quantityInStock = this.qtyTransfer);
    return; // Đảm bảo có return ở cuối cùng
  }



  reloadTransfer() {
    this.nameSearchWarehouseTransfer = ''
    this.selectedWarehouseTransfer = []
    this.fetchWarehouseTransferOnly()

    // this.modelHeight = 0
  }

  resetForm() {
    this.nameSearchProductVar = ''
    this.qtyInStock = 0
    // this.nameSearch = ''
    this.selectedProductVariants = []
    // this.modelHeight = 0
  }
  getColorNameProduct(productId: number): Observable<ColorDTO[]> {
    return this.productService.getColorNameProduct(productId).pipe(
      map(
        (response: ApiResponse<ColorDTO[]>) => response.data || []
      ), // Chỉ lấy data
      catchError(() => of([])) // Trả về mảng rỗng nếu lỗi
    );
  }
  get selectedColorName(): string {
    return this.dataColors.find(color => color.id === this.selectedColorId)?.valueName || 'Không xác định';
  }
  getImageColor(fileName: string | undefined): string {
    return this.productService.getColorImage(fileName);
  }

  getMediaInfo(mediaId: number): Observable<MediaInfoDTO | null> {
    return this.imageDetailService.getMediaInfo(mediaId).pipe(
      map((response: ApiResponse<MediaInfoDTO>) => response?.data || null),
      catchError((error) => {
        console.error('Lỗi khi gọi API getMediaInfo : ', error);
        return of(null);
      })
    );
  }
  getDetailMedia(mediaId: number): Observable<DetailMediaDTO[] | null> {
    return this.imageDetailService.getDetailMedia(mediaId).pipe(
      map((response: ApiResponse<DetailMediaDTO[]>) => response.data),
      catchError((error) => {
        console.error('Lỗi khi gọi API getDetailMedia : ', error);
        return of(null);
      })
    )
  }


  getInventoryForWarehouse(
    warehouseId: number,
    productName?: string,
    categoryId?: number,
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir?: string
  ): Observable<PageResponse<ListStoreStockDTO[]>> {

    return this.inventoryService.getInventoryForWarehouse(warehouseId, 'en', productName, categoryId, page, size, sortBy, sortDir).pipe(
      map((response: ApiResponse<PageResponse<ListStoreStockDTO[]>>) => response.data)
    );

  }




  getStore(
    name?: string,
    city?: string,
    page: number = 0,
    size: number = 10,
    userLat?: number,
    userLon?: number): Observable<PageResponse<Store[]>> {
    return this.storeService.getStore(name, city, page, size, userLat, userLon).pipe(
      map((response: ApiResponse<PageResponse<Store[]>>) => response.data || null)
    )
  }

  fetchStockData() {

    console.log(this.storeIdForWarehouse)
    const selectedCategoryId = this.selectedCategorySubChild?.id || this.selectedCategoryChild?.id || this.selectedCategoryParent?.id || null;
    this.storeService.getStoresStock(
      this.pageNo,
      this.pageSize,
      this.storeId,
      this.languageCode || 'vi', // Mặc định là 'vi' nếu không có giá trị
      this.productName,
      selectedCategoryId,
      this.sortBy || 'id',
      this.sortDir || 'asc'
    ).subscribe({
      next: (response: ApiResponse<PageResponse<ListStoreStockDTO>>) => {
        if (response.data) {
          this.stockList = response.data.content;
          this.totalPages = response.data.totalPages;
          console.log(this.storeId)

        }
      },
      error: (err) => console.error('Lỗi tải dữ liệu kho:', err)
    });
  }

  // changePage(page: number) {
  //   if (page >= 0 && page < this.totalPages) {
  //     this.pageNo = page;
  //     this.fetchStockData();
  //   }
  // }
  // changePageWarehouse(page: number) {
  //   if (page >= 0 && page < this.totalPagesWarehouse) {
  //     this.pageNoWarehouse = page;
  //     this.fetchInventoryForWarehouseOnly();
  //   }
  // }

  async fetchInventoryForWarehouseOnly(): Promise<void> {
    const response = await firstValueFrom(
      this.getInventoryForWarehouse(
        1,
        this.nameSearchWarehouse,
        this.categoryIdWarehouse,
        this.pageNoWarehouse,
        this.pageSizeWarehouse,
        this.sortByWarehouse,
        this.sortDirWarehouse
      ).pipe(catchError(() => of(null)))
    );

    this.dataPageInventoryForWarehouse = response;
    this.dataInventoryForWarehouse = response?.content?.flat() ?? [];
    this.totalPagesWarehouse = response?.totalPages ?? 0;

  }

  editInventory(tab: string) {
    const tab3 = document.getElementById(tab) as HTMLInputElement;
    if (tab3) {
      tab3.checked = true; // Chọn tab

      const myDiv = document.getElementById('dic-none');
      if (myDiv) {
        if (this.inventoryId !== 0) {
          myDiv.style.display = 'none'; // Ẩn nếu có inventoryId
        } else {
          myDiv.style.display = 'block'; // Hiện nếu inventoryId = 0
        }
      }
    }
  }

  eventClickApply = (): void => {
    if (this.inventoryId !== 0) {
      this.updateInventory()
    } else if (this.inventoryId === 0) {
      this.insertProductVariantFromWarehouse()
    }
  }

  updateInventory = async (): Promise<void> => {
    if (!this.inventoryId) {
      this.toastService.warning("Invalid Inventory ID!", "Warning", { timeOut: 3000 });
      return;
    }

    try {
      await firstValueFrom(this.inventoryService.updateInventory(this.inventoryId, this.qtyInStock));

      this.toastService.success("Inventory updated successfully!", "Success", { timeOut: 3000 });
      this.fetchInventoryForWarehouseOnly()
      this.qtyInStock = 0
      // Refresh inventory list
    } catch (error) {
      this.toastService.error("Failed to update inventory!", "Error", { timeOut: 3000 });
      console.error("❌ Error updating inventory:", error);
    }
  };



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
    this.categoryIdWarehouse = category.id
    if (this.categoryIdWarehouse !== undefined || this.categoryIdWarehouse !== null) {
      this.fetchInventoryForWarehouseOnly()
    }
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
    this.categoryIdWarehouse = category.id
    if (this.categoryIdWarehouse !== undefined || this.categoryIdWarehouse !== null) {
      this.fetchInventoryForWarehouseOnly()
    }
  }

  selectCategorySubChild(category: Category): void {
    this.selectedCategorySubChild = category;
    this.isOpenCategorySubChild = false;
    this.searchTextCategorySubChild = '';
    this.getListCategorySubSubChild(category.id);
    this.fetchStockData();
    this.categoryIdWarehouse = category.id
    if (this.categoryIdWarehouse !== undefined || this.categoryIdWarehouse !== null) {
      this.fetchInventoryForWarehouseOnly()
    }
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
      dataParentCategory: this.getParentCategories().pipe(catchError(() => of([])))
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
    this.categoryChildren = [];
    this.categorySubChildren = [];
    this.categorySubSubChildren = [];
    this.sortBy = 'productVariant.product.id'; // Giá trị mặc định
    this.sortDir = 'asc'; // Giá trị mặc định
    this.pageNo = 0; // Quay về trang đầu tiên

    this.fetchStockData(); // Gọi API để tải lại dữ liệu
  }

  resetFiltersWarehouse() {
    this.nameSearchWarehouse = '';  // Xóa tìm kiếm tên sản phẩm
    this.selectedCategoryParent = null;
    this.selectedCategoryChild = null;
    this.selectedCategorySubChild = null;
    this.categoryChildren = [];
    this.categorySubChildren = [];
    this.categorySubSubChildren = [];
    this.categoryIdWarehouse = undefined; // Xóa bộ lọc theo category
    this.sortByWarehouse = 'id'; // Giá trị mặc định
    this.sortDirWarehouse = 'asc'; // Giá trị mặc định
    this.pageNoWarehouse = 0; // Quay về trang đầu tiên

    this.fetchInventoryForWarehouseOnly(); // Gọi API để tải lại dữ liệu
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
