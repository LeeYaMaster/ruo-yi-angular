import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class JobLogApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('monitor/jobLog/list', query);
  }

  remove(jobLogId: number | string): Observable<any> {
    return this.http.delete('monitor/jobLog/' + jobLogId);
  }

  clean(): Observable<any> {
    return this.http.delete('monitor/jobLog/clean');
  }
}
