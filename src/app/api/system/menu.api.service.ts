import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('system/menu/list', query);
  }

  get(menuId: number | string): Observable<any> {
    return this.http.get('system/menu/' + menuId);
  }

  treeselect(): Observable<any> {
    return this.http.get('system/menu/treeselect');
  }

  roleMenuTreeselect(roleId: number | string): Observable<any> {
    return this.http.get('system/menu/roleMenuTreeselect/' + roleId);
  }

  add(data: any): Observable<any> {
    return this.http.post('system/menu', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/menu', data);
  }

  remove(menuId: number | string): Observable<any> {
    return this.http.delete('system/menu/' + menuId);
  }
}
