import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpUntilService} from '../http.until.service';
import {DOCUMENT} from '@angular/common';
import {environment} from '../../../environments/environment';
import {RegisterDTO} from '../../dto/user/register.dto';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {LoginDTO} from '../../dto/user/login.dto';
import {UserResponse} from '../../dto/Response/user/user.response';

import {ApiResponse} from '../../dto/Response/ApiResponse';
import {StaffLoginDto} from '../../dto/staff/staff-login.dto';
import {LoginResponse} from '../../dto/staff/staff-login-response.dto';
import {PageResponse} from '../../dto/Response/page-response';
import {StaffResponse} from '../../dto/staff/StaffResponse';
@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private userUrl = `${environment.apiBaseUrl}/staff`;

  private apiLogin = `${this.userUrl}/login`;

  localStorage?:Storage

  private apiConfig:{headers: any};

  constructor(
    private http: HttpClient,
    private httpUnitlService: HttpUntilService,
    @Inject(DOCUMENT) private document:Document
  ) {
      this.localStorage = document.defaultView?.localStorage;

      this.apiConfig = {
        headers: this.httpUnitlService.createHeaders(),
      };
  }
  login(staffLoginDTO: StaffLoginDto): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(this.apiLogin, staffLoginDTO, this.apiConfig).pipe(
      map(response => {
        if (!response || !response.data || !response.data.token) {
          throw new Error(response?.message || 'Đăng nhập thất bại');
        }
        const { token, refresh_token, username, id, roles } = response.data;

        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token',refresh_token);
        localStorage.setItem('user_info', JSON.stringify({ username, id, roles }));

        console.log('Đăng nhập thành công, token:', token);
        return response;
      }),
      catchError(error => {
        console.error('Login API error:', error);

        if (error.status === 0) {
          return throwError(() => new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.'));
        }

        const errorMessage = error.error?.message || 'Đăng nhập thất bại, vui lòng thử lại.';

        return of({
          timestamp: new Date().toISOString(), // ✅ Thêm timestamp để phù hợp với ApiResponse<LoginResponse>
          status: 400,
          message: errorMessage,
          data: null,
          errors: error
        } as unknown as ApiResponse<LoginResponse>); // ✅ Ép kiểu để tránh lỗi

      })
    );
  }


  saveUserResponseToLocalStorage(userResponse?: UserResponse) {
    try {

      if(userResponse == null || !userResponse) {
        return;
      }
      // Convert the userResponse object to a JSON string
      const userResponseJSON = JSON.stringify(userResponse);
      // Save the JSON string to local storage with a key (e.g., "userResponse")
      this.localStorage?.setItem('user', userResponseJSON);
      console.log('User response saved to local storage.');
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }

  getUserResponseFromLocalStorage():UserResponse | null {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = this.localStorage?.getItem('user');
      if(userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null; // Return null or handle the error as needed
    }
  }

  removeUserFromLocalStorage():void {
    try {
      // Remove the user data from local storage using the key
      this.localStorage?.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }

  checkUserInStore(userId: number, storeId: number): Observable<boolean> {
    console.log(`📡 Gọi API kiểm tra user: userId=${userId}, storeId=${storeId}`);
    return this.http.get<boolean>(`${this.userUrl}/check-user-store?userId=${userId}&storeId=${storeId}`)
      .pipe(
        map(response => {
          console.log(`✅ API trả về: ${response}`);
          return response;
        }),
        catchError(error => {
          console.error('❌ API lỗi:', error);
          return of(false);
        })
      );

}

  getStaffList(
    storeId?: number,
    id?: number,
    name?: string,
    startDate?: string,
    endDate?: string,
    roleId?: number,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc',
    page: number = 0,
    size: number = 10
  ): Observable<ApiResponse<PageResponse<StaffResponse>>> {
    let params = new HttpParams()
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('page', page)
      .set('size', size);

    if (storeId) params = params.set('storeId', storeId);
    if (id) params = params.set('id', id);
    if (name) params = params.set('name', name);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (roleId) params = params.set('roleId', roleId);

    return this.http.get<ApiResponse<PageResponse<StaffResponse>>>(
      `${this.userUrl}/list-staff`, { params }
    );
  }

  getStaffByUserId(userId: number): Observable<ApiResponse<StaffResponse>> {
    return this.http.get<ApiResponse<StaffResponse>>(`${this.userUrl}/${userId}`);
  }

  updateStaffStatus(userId: number, isActive: boolean): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.userUrl}/${userId}/status?isActive=${isActive}`, {});
  }


  // getUserProfile(): Observable<User> {
  //   return this.http.get<User>(`${this.userUrl}/profile`);
  // }
}
