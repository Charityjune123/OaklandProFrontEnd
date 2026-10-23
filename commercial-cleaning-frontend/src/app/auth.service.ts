import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private header: string | null = null; // memory only, so a refresh logs you out

  constructor(private http: HttpClient) {}

  login(user: string, pass: string) {
    const h = 'Basic ' + btoa(user + ':' + pass);
    return this.http.get('/api/admin/ping', { headers: { Authorization: h }, responseType: 'text' })
      .pipe(tap(() => (this.header = h)));
  }
  logout() { this.header = null; }
  loggedIn() { return !!this.header; }
  get authHeader() { return this.header; }
}