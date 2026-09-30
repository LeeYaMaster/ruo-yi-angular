import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class ServerApiService {
  private http = inject(BaseHttp);

  getServer(): Observable<any> {
    return this.http.get('monitor/server');
  }
}
