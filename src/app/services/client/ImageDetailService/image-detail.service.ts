import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../dto/Response/ApiResponse';
import { MediaInfoDTO } from '../../../dto/MediaInfoDTO';
import { DetailMediaDTO } from '../../../dto/DetailMediaDTO';

@Injectable({
  providedIn: 'root'
})
export class ImageDetailService {

  constructor(private http : HttpClient) {}
  private apiUrl = `${environment.apiBaseUrl}/products/media`


  getMediaInfo(mediaId : number) : Observable<ApiResponse<MediaInfoDTO>>{
    return this.http.get<ApiResponse<MediaInfoDTO>>(`${this.apiUrl}/info/${mediaId}`)
  }
  getDetailMedia(mediaId :number) : Observable<ApiResponse<DetailMediaDTO[]>>{
    return this.http.get<ApiResponse<DetailMediaDTO[]>>(`${this.apiUrl}/detail/${mediaId}`)
  }
}
