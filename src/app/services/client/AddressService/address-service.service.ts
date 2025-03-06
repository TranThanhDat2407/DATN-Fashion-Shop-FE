import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Province } from '../../../models/Provinces';
import {AddressDTO} from '../../../dto/address/AddressDTO';
import {ApiResponse} from '../../../dto/Response/ApiResponse';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressServiceService {


  constructor(private http: HttpClient) { }


  private apiUrl = `${environment.apiBaseUrl}/address`;


  getAddressByUserId(userId: number | null): Observable<ApiResponse<AddressDTO[]>> {
    return this.http.get<ApiResponse<AddressDTO[]>>(`${this.apiUrl}/user/${userId}`);
  }
  setDefaultAddress(addressId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/set-default?addressId=${addressId}&userId=${userId}`, {});
  }

  getApiProvincesFromNominatim() : Observable<Province[]>{
    return this.http.get<Province[]>(`https://provinces.open-api.vn/api/?depth=1`)
  }
  addAddress(userId: number, address: AddressDTO): Observable<ApiResponse<AddressDTO>> {
    return this.http.post<ApiResponse<AddressDTO>>(`${this.apiUrl}/add?userId=${userId}`, address);
  }
  deleteAddress(userId: number, addressId: number): Observable<any> {
    return this.http.delete<ApiResponse<AddressDTO>>(`${this.apiUrl}/delete/${addressId}?userId=${userId}`
    );
  }
  updateAddress(userId: number, addressId: number, address: AddressDTO): Observable<ApiResponse<AddressDTO>> {
    return this.http.put<ApiResponse<AddressDTO>>(`${this.apiUrl}/update/${addressId}?userId=${userId}`, address);
  }




}
