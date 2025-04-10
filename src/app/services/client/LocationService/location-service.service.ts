import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationServiceService {
  private apiUrl = `${environment.apiBaseUrl}/ghn`; // API miễn phí

  constructor(private http: HttpClient) {
  }
  getProvinces(): Observable<any> {
    return this.http.get(`${this.apiUrl}/province`);
  }

  // 🔹 Lấy danh sách quận/huyện theo ProvinceId
  getDistricts(provinceId: number): Observable<any> {
    const params = new HttpParams().set('provinceId', provinceId);
    return this.http.get(`${this.apiUrl}/district`, { params });
  }

  // 🔹 Lấy danh sách phường/xã theo DistrictId
  getWards(districtId: number): Observable<any> {
    const params = new HttpParams().set('districtId', districtId);
    return this.http.get(`${this.apiUrl}/ward`, { params });
  }






  getDistrictsByProvince(provinceCode: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/p/${provinceCode}?depth=2`);
  }

// 🔥 Lấy danh sách phường/xã theo mã quận
  getWardsByDistrict(districtCode: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/d/${districtCode}?depth=2`);

  }
}
