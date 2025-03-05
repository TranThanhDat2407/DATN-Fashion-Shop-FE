import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpUntilService {
  createHeaders(): HttpHeaders {
return new HttpHeaders({
  'Content-Type': 'application/json',
  'Accept-language': 'en',
})
  }
}
