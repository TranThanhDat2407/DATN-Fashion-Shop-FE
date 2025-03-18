import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, map, Observable, of, tap} from 'rxjs';
import { Product } from '../../../models/Product/product';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { PageResponse } from '../../../dto/Response/page-response';
import { ProductListDTO } from '../../../dto/ProductListDTO';
import { ProductVariantDetailDTO } from '../../../models/ProductVariant/product-variant-detailDTO';
import { ColorDTO } from '../../../models/colorDTO';
import { SizeDTO } from '../../../models/sizeDTO';
import { CategoryParentDTO } from '../../../dto/CategoryParentDTO';
import { ImagesDetailProductDTO } from '../../../dto/ImagesDetailProductDTO';
import { VariantsDetailProductDTO } from '../../../dto/VariantsDetailProductDTO';
import { InventoryDTO } from '../../../dto/InventoryDTO';
import {WishlistCheckResponse} from '../../../dto/WishlistCheckResponse';
import {ProductSuggestDTO} from '../../../dto/ProductSuggestDTO';
import { ProductVariantDTO } from '../../../dto/ProductVariantDTO';
import { EditProduct } from '../../../component/admin/product/edit-product/edit-product.component';




@Injectable({
  providedIn: 'root'
})



export class ProductServiceService {

  constructor(private http: HttpClient) { }

  private apiUrl = `${environment.apiBaseUrl}/products`;

  //Lấy danh sách các product
  getProducts(
    languageCode: string,
    categoryId?: number,
    isActive: boolean = true,
    name?: string,
    minPrice?: number,
    maxPrice?: number,
    promotionId?: number, // Thêm promotionId
    page: number = 0,
    size: number = 10, // API mặc định size = 10
    sortBy: string = 'id',
    sortDir: 'asc' | 'desc' = 'asc'
  ): Observable<ApiResponse<PageResponse<ProductListDTO[]>>> {
    let params = new HttpParams();

    // Các tham số bắt buộc
    params = params.set('isActive', isActive.toString())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    // Các tham số tùy chọn (chỉ thêm nếu có giá trị)
    if (categoryId !== undefined) params = params.set('categoryId', categoryId.toString());
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    if (name) params = params.set('name', name);
    if (promotionId !== undefined) params = params.set('promotionId', promotionId.toString());

    return this.http.get<ApiResponse<PageResponse<ProductListDTO[]>>>(`${this.apiUrl}/${languageCode}`, { params });
  }


  //lấy chi tiết sản phẩm
  getProductDertail(lang: string, productId: number, userId?: number): Observable<ApiResponse<ProductVariantDetailDTO>> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('UserId', userId.toString());
    }

    return this.http.get<ApiResponse<ProductVariantDetailDTO>>(`${this.apiUrl}/lowest-price-variant/${lang}/${productId}`, { params });
  }

  getSizeProduct(productId: number): Observable<ApiResponse<SizeDTO[]>> {
    return this.http.get<ApiResponse<SizeDTO[]>>(`${this.apiUrl}/size/${productId}`)
  }

  //lấy 1 hình ảnh từ file name
  getImageProduct(fileName: string | undefined): string {
    return `${this.apiUrl}/media/${fileName}`;
  }
  //Lấy danh sách màu của sản phẩm
  getColorNameProduct(productId: number): Observable<ApiResponse<ColorDTO[]>> {
    return this.http.get<ApiResponse<ColorDTO[]>>(`${this.apiUrl}/color/${productId}`);
  }
  //Lấy ảnh màu theo tên màu
  getColorImage(fileName: string | undefined): string {
    return `${environment.apiBaseUrl}/attribute_values/color/${fileName}`;
  }
  // lấy category parent nha
  getCategoryParent(lang: string, productId: number): Observable<ApiResponse<CategoryParentDTO[]>>{
    return this.http.get<ApiResponse<CategoryParentDTO[]>>(`${this.apiUrl}/${lang}/${productId}/categories/root`)
  }
  getAllImageProduct(productId: number): Observable<ApiResponse<ImagesDetailProductDTO[]>>{
    return this.http.get<ApiResponse<ImagesDetailProductDTO[]>>(`${this.apiUrl}/images/${productId}`)
  }
  getSalePrice(productId: number, colorId: number, sizeId: number): Observable<ApiResponse<VariantsDetailProductDTO>> {
    return this.http.get<ApiResponse<VariantsDetailProductDTO>>(
      `${this.apiUrl}/variants/${productId}?colorId=${colorId}&sizeId=${sizeId}`
    );
  }
  getChangeImageOne(productId: number, colorId: number) : Observable<ApiResponse<ImagesDetailProductDTO[]>>{
    return this.http.get<ApiResponse<ImagesDetailProductDTO[]>>(`${this.apiUrl}/media/${productId}/${colorId}`)
  }

  getQuantityInStock(productId : number, colorId : number) : Observable<ApiResponse<InventoryDTO[]>>{
    return this.http.get<ApiResponse<InventoryDTO[]>>(`${this.apiUrl}/${productId}/inventory?colorId=${colorId}`)
  }
  getStatusQuantityInStock(productId: number, colorId: number, sizeId: number):  Observable<ApiResponse<InventoryDTO>>{
    return this.http.get<ApiResponse<InventoryDTO>>(`${this.apiUrl}/${productId}/${colorId}/${sizeId}/inventory`)
  }
  getVideosProduct(productId: number): Observable<ApiResponse<ImagesDetailProductDTO[]>>{
    return this.http.get<ApiResponse<ImagesDetailProductDTO[]>>(`${this.apiUrl}/videos/${productId}`)
  }
  getProductVariant(lang : string,productVariantId : number): Observable<ApiResponse<ProductVariantDetailDTO>>{
    return this.http.get<ApiResponse<ProductVariantDetailDTO>>(`${this.apiUrl}/variants/${lang}/${productVariantId}`)
  }

  isInWishlist(userId: number, productId: number, colorId: number): Observable<ApiResponse<WishlistCheckResponse>> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId.toString())
      .set('colorId', colorId.toString());

    return this.http.get<ApiResponse<WishlistCheckResponse>>(`${this.apiUrl}/wishlist/check`, { params }).pipe( // ✅ Log toàn bộ API response để debug
      catchError(error => {
        console.error('Lỗi khi kiểm tra wishlist:', error);
        return of({
          timestamp: new Date().toISOString(),
          status: 500,
          message: 'Lỗi kết nối đến server',
          data: { isInWishList: false }, // ✅ Nếu lỗi, trả về giá trị mặc định hợp lệ
          errors: null
        });
      })
    );
  }

  suggestProducts(query: string, lang: string): Observable<ProductSuggestDTO[]> {
    const url = `${this.apiUrl}/suggest/${lang}?productName=${query}`;
    return this.http.get<{ data: ProductSuggestDTO[] }>(url).pipe(
      map(response => response.data || [])
    );
  }

  getProductVariants(name: string): Observable<ApiResponse<ProductVariantDTO[]>> {
    const params = name.trim() ? `&productName=${encodeURIComponent(name)}` : '';

    return this.http.get<ApiResponse<ProductVariantDTO[]>>(`${this.apiUrl}/variants/by-product-name?languageCode=en${params}`);
  }

  editProductVariant(mediaId: number,formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/product-media/${mediaId}`, formData);
  }

  uploadMedia(productId: number,formData : FormData): Observable<any>{
    return this.http.post(`${this.apiUrl}/upload-media/${productId}`, formData)
  }
  deleteImage(mediaId: number) : Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-media/${mediaId}`)
  }

  createProduct(formData : FormData) : Observable<any>{
    return this.http.post(`${this.apiUrl}`,formData)
  }

  editProduct(productId : number) : Observable<ApiResponse<EditProduct>>{
    return this.http.get<ApiResponse<EditProduct>>(`${this.apiUrl}/edit/${productId}`)
  }
}
