import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {BannerDTO} from '../../../models/BannerDTO';
import {PageResponse} from '../../../dto/Response/page-response';
import {ProductListDTO} from '../../../dto/ProductListDTO';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(private http: HttpClient) { }

  private apiUrl = `${environment.apiBaseUrl}/banners`;


  getBanners(lang: string): Observable<ApiResponse<BannerDTO[]>> {
    return this.http.get<ApiResponse<BannerDTO[]>>(`${this.apiUrl}/${lang}`);
  }



}
