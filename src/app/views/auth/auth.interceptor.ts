import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

 
  private isExternalFileHost(url: string): boolean {
    if (/\bhttps?:\/\/[^/]*s3\.amazonaws\.com\//i.test(url)) return true;
    if (/\bhttps?:\/\/musafir-prod-media\.s3\.[^/]+\.amazonaws\.com\//i.test(url)) return true;

  

    return false;
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const access_token = this.authService.getAccessToken();

    if (this.isExternalFileHost(request.url)) {
      const clean = request.clone({
        withCredentials: false, 
        setHeaders: {}          
      });
      return next.handle(clean).pipe(
        catchError((err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.router.navigate(['/login']);
          }
          throw err;
        })
      );
    }

    let authedReq = request;
    if (access_token) {
      authedReq = request.clone({
        setHeaders: { Authorization: `Bearer ${access_token}` }
      });
    }

    return next.handle(authedReq).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.router.navigate(['/login']);
        }
        throw err;
      })
    );
    }
}
