// src/app/core/interceptors/http-progress.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpEventType
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { RequestProgressService } from '@app/shared/services/request-progress.service';

@Injectable()
export class HttpProgressInterceptor implements HttpInterceptor {
  constructor(private progress: RequestProgressService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.shouldSkipProgress(req)) {
      return next.handle(req);
    }

    const tracked = req.clone({ reportProgress: true });

    this.progress.setLabel('Loading...');
    this.progress.setMode('indeterminate');

    return next.handle(tracked).pipe(
      tap(event => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            const total = event.total || 1;
            const percent = total > 0 ? Math.round((event.loaded / total) * 100) : 0;

            this.progress.setMode('determinate');
            this.progress.setPercent(percent);

            if (percent < 100) {
              this.progress.setLabel(`Downloading... ${percent}%`);
            } else {
              this.progress.setLabel('Processing...');
            }
            break;

          case HttpEventType.UploadProgress:
            const uploadTotal = event.total || 1;
            const uploadPercent = uploadTotal > 0 ? Math.round((event.loaded / uploadTotal) * 100) : 0;

            this.progress.setMode('determinate');
            this.progress.setPercent(uploadPercent);
            this.progress.setLabel(`Uploading... ${uploadPercent}%`);
            break;

          case HttpEventType.Response:
            // Set to 100% when response arrives
            this.progress.setMode('determinate');
            this.progress.setPercent(100);
            this.progress.setLabel('Completed!');
            break;

          case HttpEventType.Sent:
            this.progress.setLabel('Sending request...');
            break;
        }
      }),
      finalize(() => {
        setTimeout(() => {
          this.progress.clear();
        }, 500);
      })
    );
  }

 
  private shouldSkipProgress(req: HttpRequest<any>): boolean {
    const skipUrls = [
      '/api/auth/',
      '/api/notifications',
      '/api/heartbeat'
    ];

    return skipUrls.some(url => req.url.includes(url));
  }
}
