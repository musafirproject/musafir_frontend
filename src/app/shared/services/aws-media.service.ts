import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { environment } from 'src/environments/environment';

type CacheEntry = { url: string; exp: number }; 

@Injectable({ providedIn: 'root' })
export class AwsMediaService {
  private cache = new Map<string, CacheEntry>();
  private API_BASE = `${environment.apiUrl}`; 

  constructor(private http: HttpClient) {}

  getSignedUrl(key: string) {
    if (!key) return of('');
    const now = Math.floor(Date.now() / 1000);
    const cached = this.cache.get(key);
    if (cached && cached.exp - 30 > now) return of(cached.url);

    return this.http
      .get<{ url: string }>(`${this.API_BASE}/common/aws-media/signed-url`, { params: { key } })
      .pipe(
        map(({ url }) => {
          let exp = now + 3600;
          try {
            const u = new URL(url);
            const d = u.searchParams.get('X-Amz-Date');     
            const e = u.searchParams.get('X-Amz-Expires'); 
            if (d && e) {
              const dt = Date.UTC(
                +d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8),
                +d.slice(9, 11), +d.slice(11, 13), +d.slice(13, 15)
              );
              exp = Math.floor(dt / 1000) + parseInt(e, 10);
            }
          } catch {}
          this.cache.set(key, { url, exp });
          return url;
        })
      );
  }

  refreshSignedUrl(key: string) {
    this.cache.delete(key);
    return this.getSignedUrl(key);
  }
}
