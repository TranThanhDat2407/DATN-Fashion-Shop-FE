import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../dto/Response/ApiResponse';
import { Currency } from '../../models/Currency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor(private http : HttpClient) { }
  private apiUrl= `${environment.apiBaseUrl}/currencies`

  
  getCurrency(): Observable<ApiResponse<Currency[]>>{
    return this.http.get<ApiResponse<Currency[]>>(`${this.apiUrl}`)
  }
}
