import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class OperlogApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('monitor/operlog/list', query);
  }

  remove(operId: number | string): Observable<any> {
    return this.http.delete('monitor/operlog/' + operId);
  }

  clean(): Observable<any> {
    return this.http.delete('monitor/operlog/clean');
  }
}
