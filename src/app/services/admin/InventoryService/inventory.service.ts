import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { PageResponse } from '../../../dto/Response/page-response';
import { ListStoreStockDTO } from '../../../dto/ListStoreStockDTO';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiBaseUrl}/inventory`;

  constructor(private http: HttpClient) { }


  getInventoryForWarehouse(
    warehouseId: number,
    languageCode?: string,
    productName?: string,
    categoryId?: number,
    page?: number,
    size?: number,
    sortBy?: string,
    sortDir?: string
  ): Observable<ApiResponse<PageResponse<ListStoreStockDTO[]>>> {
    let url = `${this.apiUrl}/warehouse-inventory/${warehouseId}?`;

    if (languageCode) url += `languageCode=${languageCode}&`;
    if (productName) url += `productName=${productName}&`;
    if (categoryId !== undefined) url += `categoryId=${categoryId}&`;
    if (page !== undefined) url += `page=${page}&`;
    if (size !== undefined) url += `size=${size}&`;
    if (sortBy) url += `sortBy=${sortBy}&`;
    if (sortDir) url += `sortDir=${sortDir}`;

    // Xóa ký tự `&` cuối nếu có
    url = url.replace(/&$/, '');

    console.log(url)

    return this.http.get<ApiResponse<PageResponse<ListStoreStockDTO[]>>>(url);
  }

  insertInventory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/warehouse-inventory/insert`, data);
  }

  updateInventory(inventoryId : number , newQuantity : number) : Observable<any>{
    return this.http.put(`${this.apiUrl}/warehouse-inventory/${inventoryId}?newQuantity=${newQuantity}`,{})
  } 
}
