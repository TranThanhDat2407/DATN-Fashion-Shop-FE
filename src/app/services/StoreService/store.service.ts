import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PageResponse } from '../../dto/Response/page-response';
import { Store } from '../../models/Store/Store';
import { ApiResponse } from '../../dto/Response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private api_url  = `${environment.apiBaseUrl}/store`;

  constructor(private http: HttpClient) { }





}
