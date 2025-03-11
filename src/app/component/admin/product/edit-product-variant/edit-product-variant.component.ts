import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MediaInfoDTO } from '../../../../dto/MediaInfoDTO';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { ImageDetailService } from '../../../../services/client/ImageDetailService/image-detail.service';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { DetailMediaDTO } from '../../../../dto/DetailMediaDTO';
import { HeaderAdminComponent } from "../../header-admin/header-admin.component";
import { SizeDTO } from '../../../../models/sizeDTO';
import { ProductServiceService } from '../../../../services/client/ProductService/product-service.service';
import { ColorDTO } from '../../../../models/colorDTO';
import { ProductVariantDTO } from '../../../../dto/ProductVariantDTO';
import { response } from 'express';
import { ButtonComponent } from "../../button/button.component";
import { ToastrService } from 'ngx-toastr';

interface ProductVariantModel {
  sortOrder: number;
  modelHeight: number;
  colorValueId: number;
  productVariantIds: number[];
}

@Component({
  selector: 'app-edit-product-variant',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, HeaderAdminComponent, ButtonComponent],
  templateUrl: './edit-product-variant.component.html',
  styleUrl: './edit-product-variant.component.scss'
})
export class EditProductVariantComponent implements OnInit {
  mediaId!: number;
  productId!: number;
  checkedItem: number[] = [];


  dataMediaInfo: MediaInfoDTO | null = null;
  dataColors: ColorDTO[] = [];
  selectedColorId!: number;
  colorId?: number;
  dataProductVariant: ProductVariantDTO[] = []
  modelHeight: number = 0

  nameSearch: string = ''
  selectedProductVariants: number[] = [];
  newProductVariant: ProductVariantModel = {
    sortOrder: 0,
    modelHeight: 0,
    colorValueId: 0,
    productVariantIds: []
  }

  constructor(private route: ActivatedRoute, private router: Router,
    private imageDetailService: ImageDetailService,
    private productService: ProductServiceService,
    private toastService: ToastrService
  ) { }


  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.mediaId = Number(params.get('id'));
      this.productId = Number(params.get('productId'));
      console.log('Product Variant ID:', this.mediaId);
      console.log('Product ID:', this.productId);
    });

    await this.fetchImageDetail(this.mediaId)
  }

  async fetchImageDetail(mediaId: number): Promise<void> {
    if (!mediaId) {
      console.log('mediaId error');
      return;
    }

    const callApis = {
      dataMediaInfo: this.getMediaInfo(mediaId).pipe(catchError(() => of(null))),
      dataDetailMedia: this.getDetailMedia(mediaId).pipe(catchError(() => of([]))),
      dataColors: this.getColorNameProduct(this.productId).pipe(catchError(() => of([]))),
      dataProductVariant: this.getProductVariant(this.nameSearch).pipe(catchError(() => of([])))


    };

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataMediaInfo = response.dataMediaInfo;
    this.dataColors = response.dataColors;
    this.dataProductVariant = response.dataProductVariant



  }

  searchProductItem(): void {
    console.log(this.nameSearch)
    this.fetchImageDetail(this.mediaId)
  }
  getProductVariant(name: string): Observable<ProductVariantDTO[]> {
    return this.productService.getProductVariants(name).pipe(
      map((response: ApiResponse<ProductVariantDTO[]>) => response.data || []),
      catchError(() => of([]))
    )
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
  selectColor(color: ColorDTO): void {
    this.selectedColorId = color.id;
    this.colorId = color.id;

    // this.changeImageOne(this.productId ?? 0, color.id).subscribe(images => {
    //   if (images) {
    //     this.productImageUrl = images[0].mediaUrl;
    //     this.cdr.detectChanges();
    //   }
    // });

    this.fetchImageDetail(this.mediaId);
  }

  editProductVariant = () => {
    const sampleProductVariant: ProductVariantModel = {
      sortOrder: 1,
      modelHeight: this.modelHeight,
      colorValueId: this.selectedColorId,
      productVariantIds: this.selectedProductVariants
    }
    if (sampleProductVariant.modelHeight === 0) {
      this.toastService.error('Model Height  is emty', "Error", { timeOut: 3000 });
      return;
    }
    if (!this.selectedColorId || this.selectedColorId < 1) {
      this.toastService.error('Please choose color!', "Error", { timeOut: 3000 });
      return;
    }


    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(sampleProductVariant)], { type: 'application/json' }));
    this.productService.editProductVariant(this.mediaId, formData).subscribe({
      next: response => {
        this.toastService.success('Success', 'Product Variant edit successfully!', { timeOut: 3000 });
        this.resetForm();
      },
      error: error => {
        this.toastService.error('Error', 'There was an error creating the Product Variant.', { timeOut: 3000 });
        console.log(error);
      }
    });
  }
  resetForm() {
    this.newProductVariant = {
      sortOrder: 0,
      modelHeight: 0,
      colorValueId: 0,
      productVariantIds: []
    }
    this.nameSearch = ''
    this.selectedProductVariants = []
    this.modelHeight = 0
    this.selectedColorId = 0
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
}
