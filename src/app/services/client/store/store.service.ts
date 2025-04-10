import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { WishlistDTO } from '../../../dto/wishlistDTO';
import { ListStoreDTO } from '../../../dto/ListStoreDTO';
import { PageResponse } from '../../../dto/Response/page-response';
import { StoreInventoryDTO } from '../../../dto/StoreInventoryDTO';
import { StoreDetailDTO } from '../../../dto/StoreDetailDTO';
import { ListStoreStockDTO } from '../../../dto/ListStoreStockDTO';
import { InventoryAudResponse } from '../../../dto/Response/inventory/InventoryAudResponse';
import { TopProduct } from '../../../component/staff/store-dashboard/top-products-table/top-products-table.component';
import { StoreOrderComparisonResponse } from '../../../dto/store/StoreOrderComparisonResponse';
import { StorePaymentComparisonResponse } from '../../../dto/store/StorePaymentComparisonResponse';
import { StoreRevenueByDateRangeResponse } from '../../../dto/store/StoreRevenueByDateRangeResponse';
import { StoreDailyRevenueResponse } from '../../../dto/store/StoreDailyRevenueResponse';
import { StoreOrderResponse } from '../../../dto/store/StoreOrderResponse';
import { Store } from '../../../models/Store/Store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl: string = `${environment.apiBaseUrl}/store`;

  constructor(private http: HttpClient) { }


  deleteStore(storeId : number) : Observable<any>{
    return this.http.delete(`${this.apiUrl}/${storeId}`)
  }

  createStore(data: any) : Observable<any>{
    return this.http.post(`${this.apiUrl}`,data)
  }
  editStore( storeId : number): Observable<ApiResponse<ListStoreDTO>>{
    return this.http.get<ApiResponse<ListStoreDTO>>(`${this.apiUrl}/${storeId}`)
  }

  updateStore( storeId : number,data: any): Observable<any>{
    return this.http.put<ApiResponse<ListStoreDTO>>(`${this.apiUrl}/${storeId}`,data)
  }

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

  getStore(
    name?: string,
    city?: string,
    page: number = 0,
    size: number = 10,
    userLat?: number,
    userLon?: number
  ): Observable<ApiResponse<PageResponse<Store[]>>> {
    let params = `?page=${page}&size=${size}`;

    if (name) {
      params += `&name=${encodeURIComponent(name)}`;
    }
    if (city) {
      params += `&city=${encodeURIComponent(city)}`;
    }
    if (userLat !== undefined && userLon !== undefined) {
      params += `&userLat=${userLat}&userLon=${userLon}`;
    }

    return this.http.get<ApiResponse<PageResponse<Store[]>>>(`${this.apiUrl}/search${params}`);
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

  getTopProducts(storeId: number, page: number, size: number): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/dashboard/${storeId}/top-products?page=${page}&size=${size}`);
  }

  getLatestOrders(storeId: number, page: number, size: number) {
    return this.http.get<any>(
      `${this.apiUrl}/dashboard/${storeId}/latest-orders?page=${page}&size=${size}`
    );
  }

  getMonthlyRevenue(storeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/monthly-revenue?storeId=${storeId}`);
  }

  getWeeklyRevenue(storeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/weekly-revenue?storeId=${storeId}`);
  }

  getOrderComparison(storeId: number): Observable<StoreOrderComparisonResponse> {
    return this.http.get<StoreOrderComparisonResponse>(`${this.apiUrl}/dashboard/order-comparison/${storeId}`);
  }

  getPaymentComparison(storeId: number): Observable<StorePaymentComparisonResponse> {
    return this.http.get<StorePaymentComparisonResponse>(`${this.apiUrl}/dashboard/payment-comparison/${storeId}`);
  }


  getTotalRevenueToday(storeId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/dashboard/revenue/today`,
      { params: { storeId: storeId.toString() } }
    );
  }

  getTotalRevenueThisMonth(storeId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/dashboard/revenue/month`,
      { params: { storeId: storeId.toString() } }
    );
  }

  getTotalOrdersToday(storeId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/dashboard/orders/today`,
      { params: { storeId: storeId.toString() } }
    );
  }

  getTotalOrdersThisMonth(storeId: number): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/dashboard/orders/month`,
      { params: { storeId: storeId.toString() } }
    );
  }

  getRevenueByDateRange(
    storeId: number,
    startDate: string,
    endDate: string
  ): Observable<StoreRevenueByDateRangeResponse[]> {
    const params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<StoreRevenueByDateRangeResponse[]>(`${this.apiUrl}/revenue-by-date-range`, { params });
  }

  getDailyRevenue(
    storeId: number,
    month: number,
    year: number
  ): Observable<StoreDailyRevenueResponse[]> {
    const params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('month', month)
      .set('year', year);

    return this.http.get<StoreDailyRevenueResponse[]>(`${this.apiUrl}/daily-revenue`, { params });
  }

  exportRevenueByDateRange(
    storeId: number,
    startDate: string,
    endDate: string
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/export-revenue-by-date-range`, {
      params,
      responseType: 'blob',
    });
  }

  exportDailyRevenueByMonthAndYear(
    storeId: number,
    month: number,
    year: number
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('month', month)
      .set('year', year);

    return this.http.get(`${this.apiUrl}/export-daily-revenue-by-month-and-year`, {
      params,
      responseType: 'blob',
    });
  }

  exportStoreOrdersToExcel(
    storeId: number,
    orderStatusId?: number,
    paymentMethodId?: number,
    shippingMethodId?: number,
    customerId?: number,
    staffId?: number,
    startDate?: string,
    endDate?: string,
    languageCode: string = 'vi'
  ): Observable<Blob> {
    // Tạo các tham số query
    let params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('languageCode', languageCode);

    if (orderStatusId) params = params.set('orderStatusId', orderStatusId.toString());
    if (paymentMethodId) params = params.set('paymentMethodId', paymentMethodId.toString());
    if (shippingMethodId) params = params.set('shippingMethodId', shippingMethodId.toString());
    if (customerId) params = params.set('customerId', customerId.toString());
    if (staffId) params = params.set('staffId', staffId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    // Gọi API và trả về file Excel dưới dạng Blob
    return this.http.get(`${this.apiUrl}/export-store-orders`, {
      params: params,
      responseType: 'blob'
    });
  }

  getRevenueByCity(year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/revenue-by-city?year=${year}`);
  }

  getTopStoresByRevenue(year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-revenue?year=${year}`);
  }

}
