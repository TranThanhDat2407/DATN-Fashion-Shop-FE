import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, map, Observable, of} from 'rxjs';
import {CategoryDTO} from '../../../dto/CategoryDTO';
import {ApiResponse} from '../../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl= `${environment.apiBaseUrl}`;

  private categoriesSubject = new BehaviorSubject<any[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadCategories(language: string, parentId: number): void {
    this.http.get<ApiResponse<CategoryDTO[]>>(
      `${this.apiUrl}/categories/${language}/category/parent/${parentId}`
    ).pipe(
      map(response => response.data) // Lấy dữ liệu data từ API
    ).subscribe((data) => {
      this.categoriesSubject.next(data); // Cập nhật dữ liệu vào BehaviorSubject
    });
  }

  getCategoryParent(languageCode: string): Observable<ApiResponse<CategoryDTO[]>> {
    return this.http.get<ApiResponse<CategoryDTO[]>>(`${this.apiUrl}/categories/${languageCode}/parent`);
  }

  getCategories(languageCode: string, parentId: number): Observable<ApiResponse<CategoryDTO[]>> {
    return this.http.get<ApiResponse<CategoryDTO[]>>(`${this.apiUrl}/categories/${languageCode}/category/parent/${parentId}`);
  }

  getCategory(languageCode: string, id: number): Observable<CategoryDTO> {
    return this.http.get<ApiResponse<CategoryDTO>>(`${this.apiUrl}/categories/${languageCode}/category/${id}`).pipe(
      map(response =>  response.data)
    );
  }

  getCategoryImage(fileName: string): string{
    return `${this.apiUrl}/categories/image/${fileName}`
  }

  getNameCategory(languageCode: string, categoryId: number): Observable<string> {
    return this.getCategory(languageCode, categoryId).pipe(
      map(category => category?.name || 'Danh mục không tồn tại'), // Nếu không tìm thấy, trả về mặc định
      catchError(() => of('Lỗi lấy danh mục')) // Bắt lỗi API
    );
  }
}
