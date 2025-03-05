import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../dto/Response/ApiResponse';
import { LanguageDTO } from '../../dto/LanguageDTO';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  constructor(private http :  HttpClient) { }
  private apiUrl = `${environment.apiBaseUrl}`



  getLanguages(): Observable<ApiResponse<LanguageDTO[]>>{
    return this.http.get<ApiResponse<LanguageDTO[]>>(`${this.apiUrl}/languages`)
  }
}
