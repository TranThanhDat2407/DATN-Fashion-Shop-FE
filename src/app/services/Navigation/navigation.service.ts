import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {LanguageDTO} from '../../dto/LanguageDTO';
import {CurrencyDTO} from '../../dto/CurrencyDTO';
import {ApiResponse} from '../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private apiUrl= `${environment.apiBaseUrl}`;
  private currencies: CurrencyDTO[] = [];
  constructor(private http: HttpClient) { }

  getLanguage(): Observable<LanguageDTO[]> {
    return this.http.get<ApiResponse<LanguageDTO[]>>(`${this.apiUrl}/languages`).pipe(
      map(response => response.data) // Lấy phần data từ ApiResponse
    );
  }

  getCurrency(): Observable<CurrencyDTO[]> {
    return this.http.get<ApiResponse<CurrencyDTO[]>>(`${this.apiUrl}/currencies`).pipe(
      map(response => response.data) // Lấy phần data từ ApiResponse
    );
  }



  // Biến BehaviorSubject để lưu trữ giá trị ngôn ngữ và tiền tệ
  private langSubject = new BehaviorSubject<string>('vi');
  private currencySubject = new BehaviorSubject<string>('vn');




  // Observable để các component subscribe và nhận giá trị mới
  currentLang$ = this.langSubject.asObservable();
  currentCurrency$ = this.currencySubject.asObservable();


  // Hàm cập nhật giá trị ngôn ngữ
  updateLang(newLang: string) {
    this.langSubject.next(newLang);
  }

  // Hàm cập nhật giá trị tiền tệ
  updateCurrency(newCurrency: string) {
    this.currencySubject.next(newCurrency);
  }

//--------------------------------isSearchActiveSource------------------------------
  private isSearchActiveSource = new BehaviorSubject<boolean>(false); // Biến boolean được quản lý
  isSearchActive$ = this.isSearchActiveSource.asObservable(); // Observable để các component subscribe

  setSearchActive(value: boolean): void {
    this.isSearchActiveSource.next(value);
  }

  toggleSearchActive(): void {
    const currentValue = this.isSearchActiveSource.value;
    this.isSearchActiveSource.next(!currentValue);
  }

}
