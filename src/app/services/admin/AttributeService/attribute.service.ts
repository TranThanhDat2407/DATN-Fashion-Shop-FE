import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { PageResponse } from '../../../dto/Response/page-response';
import { Color } from '../../../models/AttributeValue/Color';
import { Size } from '../../../models/AttributeValue/Size';
import { Attribute_value } from '../../../component/admin/attribute/edit-attribute/edit-attribute.component';


@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  constructor(private http: HttpClient) { }
  private apiUrl = `${environment.apiBaseUrl}/attribute_values`


  createColor(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/color`, formData)
  }


  updateColor(colorId: number, attribute: Attribute_value, selectedFile?: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(attribute)], { type: 'application/json' }));

    if (selectedFile) {
      formData.append('colorImage', selectedFile, selectedFile.name);
    }

    console.log('selectedFile:', selectedFile);
    console.log('selectedFile:', attribute);
    return this.http.put(`${this.apiUrl}/color/${colorId}`, formData);
  }


  updateSize(sizeId: number, attribute: Attribute_value): Observable<any> {
    return this.http.put(`${this.apiUrl}/size/${sizeId}`, attribute);
  }

  deleteColor(colorId :number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/color/${colorId}`)
  }
  deleteSize(sizeId :number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/size/${sizeId}`)
  }


  createSize(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/size`, formData)
  }

  getSizes(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string
  ): Observable<ApiResponse<PageResponse<Size[]>>> {
    let params = `?page=${page}&size=${size}`;

    if (name || name === '') {
      params += `&name=${encodeURIComponent(name)}`;
    }
    if (sortBy) {
      params += `&sortBy=${encodeURIComponent(sortBy)}`;
    }
    if (sortDir) {
      params += `&sortDir=${encodeURIComponent(sortDir)}`;
    }

    return this.http.get<ApiResponse<PageResponse<Color[]>>>(`${this.apiUrl}/sizes${params}`);
  }

  getColors(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string

  ): Observable<ApiResponse<PageResponse<Color[]>>> {
    let params = `?page=${page}&size=${size}`;


    if (name) {
      params += `&name=${encodeURIComponent(name)}`;
    }
    if (sortBy) {
      params += `&sortBy=${encodeURIComponent(sortBy)}`;
    }
    if (sortDir) {
      params += `&sortDir=${encodeURIComponent(sortDir)}`;
    }

    return this.http.get<ApiResponse<PageResponse<Color[]>>>(`${this.apiUrl}/colors${params}`);
  }

}
