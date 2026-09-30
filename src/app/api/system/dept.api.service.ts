import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class DeptApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('system/dept/list', query);
  }

  listExclude(deptId: number | string): Observable<any> {
    return this.http.get('system/dept/list/exclude/' + deptId);
  }

  get(deptId: number | string): Observable<any> {
    return this.http.get('system/dept/' + deptId);
  }

  add(data: any): Observable<any> {
    return this.http.post('system/dept', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/dept', data);
  }

  remove(deptId: number | string): Observable<any> {
    return this.http.delete('system/dept/' + deptId);
  }
}
