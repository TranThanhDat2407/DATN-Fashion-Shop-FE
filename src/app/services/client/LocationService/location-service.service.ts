import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationServiceService {
  private baseUrl = 'https://provinces.open-api.vn/api'; // API miễn phí

  constructor(private http: HttpClient) {
  }

  getProvinces(): Observable<any> {
    return this.http.get(`${this.baseUrl}/p`);
  }

  getAllDistricts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/d`);
  }
  getDistricts(provinceCode: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/p/${provinceCode}?depth=2`);
  }

  getWards(districtCode: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/d/${districtCode}?depth=2`);
  }

  getDistrictsByProvince(provinceCode: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/p/${provinceCode}?depth=2`);
  }

// 🔥 Lấy danh sách phường/xã theo mã quận
  getWardsByDistrict(districtCode: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/d/${districtCode}?depth=2`);

  }
}
