import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
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
}
