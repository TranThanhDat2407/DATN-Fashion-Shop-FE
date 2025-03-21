import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {PageResponse} from '../../../dto/Response/page-response';


interface TopProduct {
  productVariantId: number;
  productName: string;
  color: string;
  colorImage: string;
  size: string;
  imageUrl: string;
  totalSold: number;
  totalRevenue: number;
}

export interface CountStartAndWishList {
  productVariantId: number;
  productName: string;
  color: string;
  colorImage: string;
  size: string;
  imageUrl: string;
  totalPrice: number;
  totalStart: number;
  totalWishList: number;
}

export interface InventoryStatistics {
  productVariantId: number;
  productName: string;
  color: string;
  colorImage: string;
  size: string;
  imageUrl: string;
  totalQuantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class RevenueService {
  private apiUrl = 'http://localhost:8080/api/v1/revenue';

  constructor(private http: HttpClient) {}

  getDailyRevenue(date: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/daily`, { params: { date } });
  }

  getMonthlyRevenue(year: number, month: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/monthly`, {
      params: { year: year.toString(), month: month.toString() },
    });
  }

  getYearlyRevenue(year: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/yearly`, {
      params: { year: year.toString() },
    });
  }

  getTopSellingProducts(languageCode: string, page: number, size: number): Observable<ApiResponse<PageResponse<TopProduct>>> {
    return this.http.get<ApiResponse<PageResponse<TopProduct>>>(`${this.apiUrl}/top-products`, {
      params: { languageCode, page: page.toString(), size: size.toString() },
    });
  }

  getProductStats(
    languageCode: string,
    productId?: number,
    productName?: string,
    minStars?: number,
    sortColumn?: string,
    sortDirection?: 'asc' | 'desc',
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<CountStartAndWishList>>> {
    let params = new HttpParams()
      .set('languageCode', languageCode)
      .set('page', page.toString())
      .set('size', size.toString());

    if (productId) params = params.set('productId', productId.toString());
    if (productName?.trim()) params = params.set('productName', productName);
    if (minStars) params = params.set('minStars', minStars.toString());
    if (sortColumn) params = params.set('sortColumn', sortColumn);
    if (sortDirection) params = params.set('sortDirection', sortDirection);

    return this.http.get<ApiResponse<PageResponse<CountStartAndWishList>>>(
      `${this.apiUrl}/count/start-wishlist`, { params }
    );
  }




  getInventoryStats(
    storeId: number,
    productName?: string,
    color?: string,
    sizes?: string,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<InventoryStatistics>>> {
    let params = new HttpParams()
      .set('storeId', storeId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    if (productName) params = params.set('productName', productName);
    if (color) params = params.set('color', color);
    if (sizes) params = params.set('sizes', sizes);

    return this.http.get<ApiResponse<PageResponse<InventoryStatistics>>>(
      `${this.apiUrl}/inventory`,
      { params }
    );
  }



}
