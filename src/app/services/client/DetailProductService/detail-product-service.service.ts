import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { VariantsDetailProductDTO } from '../../../dto/VariantsDetailProductDTO';
import { DetailProductDTO } from '../../../dto/DetailProductDTO';

@Injectable({
  providedIn: 'root'
})
export class DetailProductService {

  constructor(private http : HttpClient) { }
  private apiUrl = `${environment.apiBaseUrl}/products/detail`;

  getDetailProduct(lang: string, productId: number) : Observable<ApiResponse<DetailProductDTO>> {
    return this.http.get<ApiResponse<DetailProductDTO>>(`${this.apiUrl}/${lang}/${productId}`)
  }
  

}
