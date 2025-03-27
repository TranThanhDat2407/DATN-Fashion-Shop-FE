import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpUntilService} from '../http.until.service';
import {DOCUMENT} from '@angular/common';
import {environment} from '../../../environments/environment';
import {RegisterDTO} from '../../dto/user/register.dto';
import {catchError, map, Observable, throwError} from 'rxjs';
import {LoginDTO} from '../../dto/user/login.dto';
import {UserResponse} from '../../dto/Response/user/user.response';
import {User} from '../../models/user';
import {ApiResponse} from '../../dto/Response/ApiResponse';
import {UserDetailDTO} from '../../dto/UserDetailDTO';
import {TokenService} from '../token/token.service';
import {PageResponse} from '../../dto/Response/page-response';
import {UserAdminResponse} from '../../dto/user/userAdminResponse.dto';
import {GetUsersParams} from '../../dto/user/GetUsersParams';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userUrl = `${environment.apiBaseUrl}/users`;

  private apiRegister = `${this.userUrl}/register`;
  private apiLogin = `${this.userUrl}/login`;
  private apiUserDetail = `${this.userUrl}/details`;
  private apiCheckEmail = `${this.userUrl}/check-email`;
  private apiCheckPhone = `${this.userUrl}/check-phone`;
  localStorage?:Storage

  private apiConfig:{headers: any};

  constructor(
    private http: HttpClient,
    private httpUnitlService: HttpUntilService,
    private tokenService: TokenService,
    @Inject(DOCUMENT) private document:Document
  ) {
      this.localStorage = document.defaultView?.localStorage;

      this.apiConfig = {
        headers: this.httpUnitlService.createHeaders(),
      };
  }

  register(registerDTO: RegisterDTO):Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': 'vi' // Hoặc lấy từ setting của user
    });

    return this.http.post<any>(this.apiRegister, registerDTO, { headers });
  }

  login(loginDTO: LoginDTO): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiLogin, loginDTO, this.apiConfig).pipe(
      map(response => {
        if (!response || response.status !== 200 || !response.data) {
          throw new Error(response?.message || 'Đăng nhập thất bại');
        }

        const { token, refresh_token, username, id, roles } = response.data;

        if (!token) {
          throw new Error('Không nhận được token');
        }

        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user_info', JSON.stringify({ username, id, roles }));



        console.log('Đăng nhập thành công, token:', token);

        return response.data;
      }),catchError(error => {
        // Log toàn bộ lỗi từ API
        console.error('Login API error:', error);
        if (error.error) {
          console.error('Chi tiết lỗi từ API:', error.error);
        }

        // Nếu API trả về lỗi, trích xuất thông báo lỗi nếu có
        const errorMessage = error.error?.message || 'Đăng nhập thất bại, vui lòng thử lại.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getUserInfo(): { username: string; id: number; roles: string[] } | null {
    try {
      const userInfoJSON = localStorage.getItem('user_info');
      if (!userInfoJSON) {
        return null;
      }
      return JSON.parse(userInfoJSON);
    } catch (error) {
      // console.error('❌ Lỗi khi lấy thông tin user từ localStorage:', error);
      return null;
    }
  }


  getUserDetail(token: string): Observable<UserDetailDTO> {
    return this.http.post<ApiResponse<UserDetailDTO>>(
      this.apiUserDetail,
      {},
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      }
    ).pipe(
      map(response => {
        if (response.status === 200 && response.data) {
          return response.data; // Lấy `data` từ `ApiResponse`
        } else {
          throw new Error(response.message || "Không thể lấy thông tin người dùng");
        }
      }),
      catchError(error => {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        return throwError(() => new Error("Lỗi lấy thông tin người dùng"));
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

  checkEmail(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(this.apiCheckEmail, { params });
  }

  checkPhone(phone: string): Observable<boolean> {
    const params = new HttpParams().set('phone', phone);
    return this.http.get<boolean>(this.apiCheckPhone, {params});
  }
  updateUser(userId: number, userData: Partial<UserDetailDTO>): Observable<any> {
    const token = this.tokenService.getToken();
    if (!token) {
      return throwError(() => new Error("Không tìm thấy token, vui lòng đăng nhập lại."));
    }

    const url = `${this.userUrl}/${userId}`;

    // Thêm Authorization vào request
    const options = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };

    return this.http.put<ApiResponse<any>>(url, userData, options).pipe(
      map(response => {
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error(response.message || "Cập nhật thất bại.");
        }
      }),
      catchError(error => {
        console.error("Lỗi cập nhật user:", error);
        return throwError(() => new Error(error.error?.message || "Lỗi khi cập nhật thông tin người dùng."));
      })
    );
  }
  checkUserValid(userId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.userUrl}/valid/${userId}`).pipe(
      map(response => response.data)
    );
  }
  searchUsers(keyword: string): Observable<UserAdminResponse[]> {
    let params = new HttpParams().set('size', '10').set('roleId', '2');

    if (keyword) {
      params = params.set('email', keyword)
    }

    // console.log('🔎 API Request Params:', params.toString()); // Debug params

    return this.http.get<ApiResponse<PageResponse<UserAdminResponse>>>(`${this.userUrl}/all`, { params })
      .pipe(
        map(response => {
          // console.log('📌 Kết quả từ API:', response.data.content); // Debug dữ liệu trên console
          return response.data.content;
        })
      );

  }

  changePassword(userId: number, currentPassword: string, newPassword: string, retypePassword: string): Observable<any> {
    const params = new HttpParams().set('id', userId.toString());
    const headers = new HttpHeaders({ 'Accept-Language': 'vi' });

    const body = {
      currentPassword,
      newPassword,
      retypePassword,
      passwordMatching: newPassword === retypePassword
    };

    return this.http.post(`${this.userUrl}/change-password`, body, { headers, params });
  }

  getAllUser(params: GetUsersParams): Observable<ApiResponse<PageResponse<UserAdminResponse[]>>> {
    let httpParams = new HttpParams();

    // Chỉ append nếu có giá trị
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<ApiResponse<PageResponse<UserAdminResponse[]>>>(`${this.userUrl}/all`, { params: httpParams });
  }

  blockOrEnableUser(userId: number): Observable<any> {
    return this.http.patch(`${this.userUrl}/${userId}/block-enable`, null);
  }

}
