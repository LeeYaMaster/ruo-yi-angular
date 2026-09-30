import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class OnlineApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('monitor/online/list', query);
  }

  forceLogout(tokenId: string): Observable<any> {
    return this.http.delete('monitor/online/' + tokenId);
  }
}
