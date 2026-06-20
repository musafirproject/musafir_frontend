import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public LoginStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  storeToStorage(key: string, value: any) {
    const normalizedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, normalizedValue);
    sessionStorage.setItem(key, normalizedValue);
  }

  removeFromStorage(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  public Login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/common/login`, { email, password })
      .pipe(map((login) => login));
  }

  getToken(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/common/token/`, { email, password })
      .pipe(map((token) => token));
  }

  public register(data: any) {
    return this.http.post(`${environment.apiUrl}/common/register`, data)
      .pipe(map((registered) => registered));
  }

  private hasToken(): boolean {
    return !!this.getAccessToken();
  }

  isLoggedInStatus(): boolean {
    return this.hasToken();
  }

  setLoginState(status: boolean) {
    this.LoginStatus.next(status);
  }

  loginError() {
    return this.LoginStatus.asObservable();
  }

  public forgotPassword() {}

  resetPassword(data: any) {
    return this.http.post(`${environment.apiUrl}/common/passwordreset/`, data)
      .pipe(map((mappedResponse) => mappedResponse));
  }

  validateResetPasswordToken(token: any) {
    return this.http.post(`${environment.apiUrl}/common/passwordreset/validate_token/`, { token })
      .pipe(map((mappedToken) => mappedToken));
  }

  confirmResetPassword(token: string, password: string) {
    return this.http.post(`${environment.apiUrl}/common/passwordreset/confirm/`, { token, password })
      .pipe(map((passwordChangedResponse) => passwordChangedResponse));
  }

  public logout() {
    this.removeFromStorage('access_token');
    this.removeFromStorage('refresh_token');
    this.removeFromStorage('user');
    this.setLoginState(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  getStoredUser(): any | null {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

 getUserRole(): string | null {
  const user = this.getStoredUser();
  return user?.role?.code || null;
}
  getCurrentUser() {
    return this.http.get(`${environment.apiUrl}/common/authenticated`)
      .pipe(map((authenticatedUser) => authenticatedUser));
  }

  changePassword(data: any) {
    return this.http.put(`${environment.apiUrl}/common/change-password`, data)
      .pipe(map((user) => user));
  }
}
