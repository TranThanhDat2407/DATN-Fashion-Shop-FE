import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { ReviewTotalDTO } from '../../../dto/ReviewTotalDTO';
import { ReviewAverageDTO } from '../../../dto/ReviewAverageDTO';
import { PageResponse } from '../../../dto/Response/page-response';
import { ReviewDetailProductDTO } from '../../../dto/ReviewDetailProductDTO';
import { Review } from '../../../models/Review';
import {TotalReviewByRatingDTO} from '../../../dto/TotalReviewByRatingDTO';

@Injectable({
  providedIn: 'root'
})
export class ReviewServiceService {

  constructor(private http: HttpClient) { }
  private apiUrl = `${environment.apiBaseUrl}/reviews`


  getReviewTotal(productId: number): Observable<ApiResponse<ReviewTotalDTO>> {
    return this.http.get<ApiResponse<ReviewTotalDTO>>(`${this.apiUrl}/total/${productId}`)
  }
  getReviewAverage(productId: number): Observable<ApiResponse<ReviewAverageDTO>> {
    return this.http.get<ApiResponse<ReviewAverageDTO>>(`${this.apiUrl}/average/${productId}`)
  }

  totalReviewByRating(
    productId: number,
    reviewRating: string
  ): Observable<ApiResponse<TotalReviewByRatingDTO>> {
    return this.http.get<ApiResponse<TotalReviewByRatingDTO>>(
      `${this.apiUrl}/${productId}?reviewRating=${reviewRating}`
    );
  }

  getReviewDetailProduct(productId: number,
    page: number,
    size: number,
    sortBy: string,
    sortDir: string
  ): Observable<ApiResponse<PageResponse<ReviewDetailProductDTO[]>>> {
    return this.http.get<ApiResponse<PageResponse<ReviewDetailProductDTO[]>>>(`${this.apiUrl}/${productId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`)
  }

  createReview(review : Review) : Observable<any>{
    // const token = 'eyJhbGciOiJIUzI1NiJ9.eyJwaG9uZSI6IjA5ODc2NTQzMjEiLCJ1c2VySWQiOjIsImVtYWlsIjoiY3VzdG9tZXIxQGV4YW1wbGUuY29tIiwic3ViIjoiY3VzdG9tZXIxQGV4YW1wbGUuY29tIiwiZXhwIjoxNzQyMzgxNDM2fQ.86c9szZ1-7cOFldQ7kfk5ILAEGCz5iTtBYdUFEhqvRo';  // Lấy token từ nơi lưu trữ (localStorage, sessionStorage, v.v.)
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`
    // });
    return this.http.post(`${this.apiUrl}/create`,review)
  }
}


