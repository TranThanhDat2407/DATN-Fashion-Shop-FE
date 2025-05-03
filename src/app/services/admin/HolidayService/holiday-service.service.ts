import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {HolidayDTO} from '../../../dto/HolidayDTO';

@Injectable({
  providedIn: 'root'
})
export class HolidayServiceService {
  private apiUrl = `${environment.apiBaseUrl}/holidays`; // 🔥 Cập nhật đường dẫn API đúng

  constructor(private http: HttpClient) { }
// Lấy danh sách ngày lễ
  getHolidays(): Observable<HolidayDTO[]> {
    return this.http.get<HolidayDTO[]>(this.apiUrl);
  }

  // Thêm mới ngày lễ
  addHoliday(holiday: HolidayDTO): Observable<HolidayDTO> {
    return this.http.post<HolidayDTO>(this.apiUrl, holiday);
  }

  // Xóa ngày lễ
  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
