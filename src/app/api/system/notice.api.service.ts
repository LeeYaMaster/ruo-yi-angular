import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class NoticeApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('system/notice/list', query);
  }

  get(noticeId: number | string): Observable<any> {
    return this.http.get('system/notice/' + noticeId);
  }

  add(data: any): Observable<any> {
    return this.http.post('system/notice', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/notice', data);
  }

  remove(noticeId: number | string): Observable<any> {
    return this.http.delete('system/notice/' + noticeId);
  }
}
