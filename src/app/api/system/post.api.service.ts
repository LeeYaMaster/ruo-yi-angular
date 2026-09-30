import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class PostApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('system/post/list', query);
  }

  get(postId: number | string): Observable<any> {
    return this.http.get('system/post/' + postId);
  }

  add(data: any): Observable<any> {
    return this.http.post('system/post', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/post', data);
  }

  remove(postId: number | string): Observable<any> {
    return this.http.delete('system/post/' + postId);
  }
}
