import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../dto/Response/ApiResponse';
import { PageResponse } from '../../dto/Response/page-response';
import { InventoryTransferResponse } from '../../dto/inventory-transfer/InventoryTransferResponse';

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferService {
  private api_url = `${environment.apiBaseUrl}/inventory-transfers`;

  constructor(private http: HttpClient) { }

  getTransfersByStore(
    storeId: number,
    status?: string,
    isReturn?: boolean,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Observable<ApiResponse<PageResponse<InventoryTransferResponse>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);


    if (storeId !== 0) {
      params = params.set('storeId', storeId);
    }

    // if (storeId) {
    //   params = params.set('storeId', storeId);
    // }
    if (status) {
      params = params.set('status', status);
    }
    if (isReturn !== undefined) {
      params = params.set('isReturn', isReturn.toString());
    }
    console.log('API URL:', `${this.api_url}/store`, { params });
    return this.http.get<ApiResponse<PageResponse<InventoryTransferResponse>>>(
      `${this.api_url}/store`, { params }
    );
  }


  getTransferById(id: number): Observable<InventoryTransferResponse> {
    return this.http.get<InventoryTransferResponse>(`${this.api_url}/${id}`);
  }

  confirmTransfer(id: number, langCode: string = 'vi'): Observable<InventoryTransferResponse> {
    return this.http.put<InventoryTransferResponse>(`${this.api_url}/confirm/${id}?langCode=${langCode}`, {});
  }

  cancelTransfer(id: number, langCode: string = 'vi'): Observable<InventoryTransferResponse> {
    return this.http.put<InventoryTransferResponse>(`${this.api_url}/cancel/${id}?langCode=${langCode}`, {});
  }



}
