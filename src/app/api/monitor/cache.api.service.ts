import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class CacheApiService {
  private http = inject(BaseHttp);

  getCache(): Observable<any> {
    return this.http.get('monitor/cache');
  }

  listCacheName(): Observable<any> {
    return this.http.get('monitor/cache/getNames');
  }

  listCacheKey(cacheName: string): Observable<any> {
    return this.http.get('monitor/cache/getKeys/' + cacheName);
  }

  getCacheValue(cacheName: string, cacheKey: string): Observable<any> {
    return this.http.get('monitor/cache/getValue/' + cacheName + '/' + cacheKey);
  }

  clearCacheName(cacheName: string): Observable<any> {
    return this.http.delete('monitor/cache/clearCacheName/' + cacheName);
  }

  clearCacheKey(cacheKey: string): Observable<any> {
    return this.http.delete('monitor/cache/clearCacheKey/' + cacheKey);
  }

  clearCacheAll(): Observable<any> {
    return this.http.delete('monitor/cache/clearCacheAll');
  }
}
