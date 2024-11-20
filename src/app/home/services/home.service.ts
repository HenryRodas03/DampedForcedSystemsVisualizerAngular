import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  url = 'http://127.0.0.1:8000/simulate';
  constructor(private http: HttpClient) {}

  calculate(data: any) {
    return this.http.post(`${this.url}`, data);
  }
}
