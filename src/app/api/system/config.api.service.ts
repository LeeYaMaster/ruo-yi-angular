import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class ConfigApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('system/config/list', query);
  }

  get(configId: number | string): Observable<any> {
    return this.http.get('system/config/' + configId);
  }

  getByKey(configKey: string): Observable<any> {
    return this.http.get('system/config/configKey/' + configKey);
  }

  add(data: any): Observable<any> {
    return this.http.post('system/config', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/config', data);
  }

  remove(configId: number | string): Observable<any> {
    return this.http.delete('system/config/' + configId);
  }

  refreshCache(): Observable<any> {
    return this.http.delete('system/config/refreshCache');
  }
}
