import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {WishlistDTO} from '../../../dto/wishlistDTO';
import {ListStoreDTO} from '../../../dto/ListStoreDTO';
import {PageResponse} from '../../../dto/Response/page-response';
import {StoreInventoryDTO} from '../../../dto/StoreInventoryDTO';
import {StoreDetailDTO} from '../../../dto/StoreDetailDTO';
import {ListStoreStockDTO} from '../../../dto/ListStoreStockDTO';
import {InventoryAudResponse} from '../../../dto/Response/inventory/InventoryAudResponse';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl: string = `${environment.apiBaseUrl}/store`;

  constructor(private http: HttpClient) { }

  getStores(pageNo: number,
            pageSize: number,
            city: string,
            userLat: number,
            userLon: number): Observable<ApiResponse<PageResponse<ListStoreDTO>>> {
    let params = `?page=${pageNo}&size=${pageSize}`;

    if (city) {
      params += `&city=${encodeURIComponent(city)}`;
    }

    if (userLat && userLon) {
      params += `&userLat=${userLat}&userLon=${userLon}`;
    }

    return this.http.get<ApiResponse<PageResponse<ListStoreDTO>>>(`${this.apiUrl}/search${params}`);
  }

  getStoresForLogin(pageNo: number,
            pageSize: number,
            name: string
  ): Observable<ApiResponse<PageResponse<ListStoreDTO>>> {
    let params = `?page=${pageNo}&size=${pageSize}`;

    if (name) {
      params += `&name=${encodeURIComponent(name)}`;
    }

    return this.http.get<ApiResponse<PageResponse<ListStoreDTO>>>(`${this.apiUrl}/search${params}`);
  }

  getStoreInventory(productId: number, colorId: number, sizeId: number, storeId: number): Observable<ApiResponse<StoreInventoryDTO>> {
    const params = new HttpParams()
      .set('productId', productId)
      .set('colorId', colorId)
      .set('sizeId', sizeId)
      .set('storeId', storeId);

    return this.http.get<ApiResponse<StoreInventoryDTO>>(`${this.apiUrl}/inventory`, { params });
  }

  getStoreDetail(storeId: number): Observable<ApiResponse<StoreDetailDTO>> {
    return this.http.get<ApiResponse<StoreDetailDTO>>(`${this.apiUrl}/${storeId}`);
  }


  getStoresStock(
    pageNo: number,
    pageSize: number,
    storeId: number,
    languageCode: string = 'vi',
    productName?: string | undefined,
    categoryId?: number | null,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<ApiResponse<PageResponse<ListStoreStockDTO>>> {
    let params = new HttpParams()
      .set('page', pageNo)
      .set('size', pageSize)
      .set('languageCode', languageCode)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (productName) {
      params = params.set('productName', productName);
    }

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    return this.http.get<ApiResponse<PageResponse<ListStoreStockDTO>>>(
      `${this.apiUrl}/product-inventory/${storeId}`,
      { params }
    );
  }

  getInventoryHistory(
    storeId: number,
    pageNo: number = 0,
    pageSize: number = 10,
    updatedBy?: number,
    rev?: number,
    revType?: string,
    updatedAtFrom?: string,
    updatedAtTo?: string,
    languageCode: string = 'vi'
  ): Observable<ApiResponse<PageResponse<InventoryAudResponse>>> {
    let params = new HttpParams()
      .set('page', pageNo)
      .set('size', pageSize)
      .set('languageCode', languageCode);

    if (storeId) {
      params = params.set('storeId', storeId);
    }
    if (updatedBy) {
      params = params.set('updatedBy', updatedBy);
    }
    if (rev) {
      params = params.set('rev', rev);
    }
    if (revType) {
      params = params.set('revType', revType);
    }
    if (updatedAtFrom) {
      params = params.set('updatedAtFrom', updatedAtFrom);
    }
    if (updatedAtTo) {
      params = params.set('updatedAtTo', updatedAtTo);
    }

    return this.http.get<ApiResponse<PageResponse<InventoryAudResponse>>>(
      `http://localhost:8080/api/v1/inventory/store/inventory-history
`,
      { params }
    );
  }

}
