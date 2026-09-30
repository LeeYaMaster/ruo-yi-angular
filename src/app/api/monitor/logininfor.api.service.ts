import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class LogininforApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('monitor/logininfor/list', query);
  }

  remove(infoId: number | string): Observable<any> {
    return this.http.delete('monitor/logininfor/' + infoId);
  }

  clean(): Observable<any> {
    return this.http.delete('monitor/logininfor/clean');
  }

  unlock(userName: string): Observable<any> {
    return this.http.get('monitor/logininfor/unlock/' + userName);
  }
}
