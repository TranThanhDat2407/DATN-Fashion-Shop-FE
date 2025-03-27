import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, forkJoin, map, Observable, of, tap} from 'rxjs';
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
import { WishlistCheckResponse } from '../../../dto/WishlistCheckResponse';
import { ProductSuggestDTO } from '../../../dto/ProductSuggestDTO';
import { ProductVariantDTO } from '../../../dto/ProductVariantDTO';
import { EditProduct } from '../../../component/admin/product/edit-product/edit-product.component';
import {ProductDetailDTO} from '../../../dto/ProductDetailDTO';
import {ProductWithImage} from '../../../dto/ProductWithImage';




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
    isActive?: boolean,
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
    params = params
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    // Các tham số tùy chọn (chỉ thêm nếu có giá trị)
    if (isActive) params = params.set('isActive', isActive.toString());
    if (categoryId !== undefined) params = params.set('categoryId', categoryId.toString());
    if (minPrice !== undefined) params = params.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice.toString());
    if (name) params = params.set('name', name);
    if (promotionId !== undefined) params = params.set('promotionId', promotionId.toString());

    return this.http.get<ApiResponse<PageResponse<ProductListDTO[]>>>(`${this.apiUrl}/${languageCode}`, { params });
  }

  getProductsAdmin(
    languageCode: string,
    name?: string,
    isActive?: any,
    minPrice?: number,
    maxPrice?: number,
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir: 'asc' | 'desc' = 'asc',

  ): Observable<ApiResponse<PageResponse<ProductListDTO[]>>> {
    let params = `?page=${page}&size=${size}`;

    // if (categoryId !== undefined && categoryId !== null) {
    //   params += `&categoryId=${encodeURIComponent(categoryId)}`;
    // }
    if (name) {
      params += `&name=${encodeURIComponent(name)}`;
    }
    if (isActive !== undefined && isActive !== null) {
      params += `&isActive=${isActive}`;
    }
    if (minPrice !== undefined && minPrice !== null) {
      params += `&minPrice=${encodeURIComponent(minPrice)}`;
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      params += `&maxPrice=${encodeURIComponent(maxPrice)}`;
    }
    if (sortBy) {
      params += `&sortBy=${encodeURIComponent(sortBy)}`;
    }
    if (sortDir) {
      params += `&sortDir=${encodeURIComponent(sortDir)}`;
    }
    console.log(`${this.apiUrl}/${languageCode}${params}`)
    return this.http.get<ApiResponse<PageResponse<ProductListDTO[]>>>(`${this.apiUrl}/${languageCode}${params}`);
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
  getCategoryParent(lang: string, productId: number): Observable<ApiResponse<CategoryParentDTO[]>> {
    return this.http.get<ApiResponse<CategoryParentDTO[]>>(`${this.apiUrl}/${lang}/${productId}/categories/root`)
  }

  getCategoryForProduct(lang: string, productId: number): Observable<ApiResponse<CategoryParentDTO[]>> {
    return this.http.get<ApiResponse<CategoryParentDTO[]>>(`${this.apiUrl}/${lang}/${productId}/categories`)
  }

  getAllImageProduct(productId: number): Observable<ApiResponse<ImagesDetailProductDTO[]>> {
    return this.http.get<ApiResponse<ImagesDetailProductDTO[]>>(`${this.apiUrl}/images/${productId}`)
  }
  getSalePrice(productId: number, colorId: number, sizeId: number): Observable<ApiResponse<VariantsDetailProductDTO>> {
    return this.http.get<ApiResponse<VariantsDetailProductDTO>>(
      `${this.apiUrl}/variants/${productId}?colorId=${colorId}&sizeId=${sizeId}`
    );
  }
  getChangeImageOne(productId: number, colorId: number): Observable<ApiResponse<ImagesDetailProductDTO[]>> {
    return this.http.get<ApiResponse<ImagesDetailProductDTO[]>>(`${this.apiUrl}/media/${productId}/${colorId}`)
  }

  getQuantityInStock(productId: number, colorId: number): Observable<ApiResponse<InventoryDTO[]>> {
    return this.http.get<ApiResponse<InventoryDTO[]>>(`${this.apiUrl}/${productId}/inventory?colorId=${colorId}`)
  }
  getStatusQuantityInStock(productId: number, colorId: number, sizeId: number): Observable<ApiResponse<InventoryDTO>> {
    return this.http.get<ApiResponse<InventoryDTO>>(`${this.apiUrl}/${productId}/${colorId}/${sizeId}/inventory`)
  }
  getVideosProduct(productId: number): Observable<ApiResponse<ImagesDetailProductDTO[]>> {
    return this.http.get<ApiResponse<ImagesDetailProductDTO[]>>(`${this.apiUrl}/videos/${productId}`)
  }
  getProductVariant(lang: string, productVariantId: number): Observable<ApiResponse<ProductVariantDetailDTO>> {
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

  getProductVariants(name: string, page: number, size: number): Observable<ApiResponse<PageResponse<ProductVariantDTO[]>>> {
    const params = name.trim() ? `&productName=${encodeURIComponent(name)}` : '';

    return this.http.get<ApiResponse<PageResponse<ProductVariantDTO[]>>>(`${this.apiUrl}/variants/by-product-name?languageCode=en&page=${page}&size=${size}${params}`);
  }

  editProductVariant(mediaId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/product-media/${mediaId}`, formData);
  }

  uploadMedia(productId: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-media/${productId}`, formData)
  }
  deleteImage(mediaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-media/${mediaId}`)
  }

  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData)
  }

  editProduct(productId: number): Observable<ApiResponse<EditProduct>> {
    return this.http.get<ApiResponse<EditProduct>>(`${this.apiUrl}/edit/${productId}`)
  }

  getProductDetail(productId: number, langCode: string):Observable<ApiResponse<ProductDetailDTO>>{
    return this.http.get<ApiResponse<ProductDetailDTO>>(`${this.apiUrl}/detail/${langCode}/${productId}`);
  }

  updateProduct(productId : number, formData : FormData ) : Observable<any>{
    return this.http.put(`${this.apiUrl}/${productId}`,formData)
  }


  insertVariant(productId: number, colorValueId: number, sizeValueId: number, salePrice: number) {
    const formData = new FormData();
    formData.append('productId', productId.toString());  // Chuyển số thành chuỗi
    formData.append('colorValueId', colorValueId.toString());
    formData.append('sizeValueId', sizeValueId.toString());
    formData.append('salePrice', salePrice.toString());


    return this.http.post(`${this.apiUrl}/insert-variant/${productId}`, formData)

  }
  removeCategoryFromProduct(productId: number, categoryId: number, lang: string = 'en'): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/remove-category`,
      {
        params: {
          productId: productId.toString(),
          categoryId: categoryId.toString(),
        },
        headers: {
          'Accept-Language': lang
        }
      }
    );
  }

  setCategoryForProduct(productId: number, categoryId: number, lang: string = 'en'): Observable<ApiResponse<any>> {
    const requestBody = {
      id: productId,
      categoryId: categoryId
    };

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/set-categories`,
      requestBody,
      {
        headers: { 'Accept-Language': lang }
      }
    );
  }

  // Hàm lấy danh sách sản phẩm với ảnh
  getProductsWithImages(productIds: number[]): Observable<ProductWithImage[]> {
    const requests: Observable<any>[] = productIds.map(productId =>
      forkJoin({
        productDetail: this.getProductDetail(productId, 'en'),
        imageDetails: this.getAllImageProduct(productId)
      })
    );

    return forkJoin(requests).pipe(
      map(responses => {
        return responses.map(response => {
          const productDetail = response.productDetail.data;
          const imageUrl = response.imageDetails.data?.[0]?.mediaUrl || '';

          return {
            id: productDetail.id,
            name: productDetail.name,
            image: imageUrl
          };
        });
      })
    );
  }
  updateSalePrice(productId : number, colorId: number , salePrice :number): Observable<any>{
    return this.http.put(`${this.apiUrl}/product-variant/${productId}/${colorId}?salePrice=${salePrice}`,{})
  } 

}
