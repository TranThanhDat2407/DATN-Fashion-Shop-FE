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

export interface ReviewStatistics {
  productId: number;
  productName: string;
  totalReviews: number;
  avgRating: number;
  oneStar: number;
  twoStars: number;
  threeStars: number;
  fourStars: number;
  fiveStars: number;
  fitTight: number;
  fitSlightlyTight: number;
  fitTrueToSize: number;
  fitLoose: number;
  fitSlightlyLoose: number;
}
export interface Top3Store {
  store_id: number;
  store_name: string;
  store_address: string;
  store_phone: string;
  totalRevenue: number;
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
    return this.http.get<ApiResponse<PageResponse<TopProduct>>>(`${this.apiUrl}/top-10-products`, {
      params: { languageCode, page: page.toString(), size: size.toString() },
    });
  }

  getProductStats(
    languageCode: string,
    productId?: number,
    productName?: string,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<CountStartAndWishList>>> {
    let params = new HttpParams()
      .set('languageCode', languageCode)
      .set('page', page.toString())
      .set('size', size.toString());

    if (productId) params = params.set('productId', productId.toString());
    if (productName?.trim()) params = params.set('productName', productName);

    return this.http.get<ApiResponse<PageResponse<CountStartAndWishList>>>(
      `${this.apiUrl}/count/wishlist`, { params }
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



  getReviewStatistics(
    languageCode: string,
    productId?: number,
    productName?: string,
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<ReviewStatistics>>> {
    let params = new HttpParams()
      .set('languageCode', languageCode)
      .set('page', page.toString())
      .set('size', size.toString());

    if (productId) params = params.set('productId', productId.toString());
    if (productName) params = params.set('productName', productName);

    return this.http.get<ApiResponse<PageResponse<ReviewStatistics>>>(
      `${this.apiUrl}/count/reviews`,
      { params }
    );
  }

  getReviewsByProduct(productId: number): Observable<ApiResponse<PageResponse<any>>> {
    return this.http.get<ApiResponse<PageResponse<any>>>(`${this.apiUrl}/product/${productId}`);
  }



  getTop3StoresByRevenue(
    startDate?: Date | null,
    endDate?: Date  | null
  ): Observable<ApiResponse<Top3Store[]>> {
    let params = new HttpParams();
    console.log('Service - Start Date:', startDate);
    console.log('Service - End Date:', endDate);
    if (startDate) {
      params = params.set('startDate', this.formatDate(startDate));
    }

    if (endDate) {
      params = params.set('endDate', this.formatDate(endDate));
    }
    console.log('Final Params:', params.toString());
    return this.http.get<ApiResponse<Top3Store[]>>(
      `${this.apiUrl}/top-stores`,
      { params }
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}
