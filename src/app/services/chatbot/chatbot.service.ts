import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://127.0.0.1:5000/chat';  // URL của Flask API

  constructor(private http: HttpClient) {}

  sendMessage(message: string, languageId: number = 1): Observable<any> {
    return this.http.post<any>(this.apiUrl, { message, language_id: languageId });
  }
}
