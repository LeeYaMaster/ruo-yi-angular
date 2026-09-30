import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
  private http = inject(BaseHttp);

  list(query?: any): Observable<any> {
    return this.http.get('system/role/list', query);
  }

  get(roleId: number | string): Observable<any> {
    return this.http.get('system/role/' + roleId);
  }

  add(data: any): Observable<any> {
    return this.http.post('system/role', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/role', data);
  }

  remove(roleId: number | string): Observable<any> {
    return this.http.delete('system/role/' + roleId);
  }

  changeStatus(roleId: number, status: string): Observable<any> {
    return this.http.put('system/role/changeStatus', { roleId, status });
  }

  dataScope(data: any): Observable<any> {
    return this.http.put('system/role/dataScope', data);
  }

  deptTree(roleId: number | string): Observable<any> {
    return this.http.get('system/role/deptTree/' + roleId);
  }

  allocatedUserList(query?: any): Observable<any> {
    return this.http.get('system/role/authUser/allocatedList', query);
  }

  unallocatedUserList(query?: any): Observable<any> {
    return this.http.get('system/role/authUser/unallocatedList', query);
  }

  authUserCancel(data: any): Observable<any> {
    return this.http.put('system/role/authUser/cancel', data);
  }

  authUserCancelAll(data: any): Observable<any> {
    return this.http.put('system/role/authUser/cancelAll', data);
  }

  authUserSelectAll(data: any): Observable<any> {
    return this.http.put('system/role/authUser/selectAll', data);
  }
}
