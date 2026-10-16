import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../http/config';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(BaseHttp);
  private httpClient = inject(HttpClient);

  list(query?: any): Observable<any> {
    return this.http.get('system/user/list', query);
  }

  get(userId: number | string): Observable<any> {
    return this.http.get('system/user/' + userId);
  }

  getPostsAndRoles(): Observable<any> {
    return this.http.get('system/user');
  }

  add(data: any): Observable<any> {
    return this.http.post('system/user', data);
  }

  update(data: any): Observable<any> {
    return this.http.put('system/user', data);
  }

  remove(userId: number | string): Observable<any> {
    return this.http.delete('system/user/' + userId);
  }

  resetPwd(userId: number, password: string): Observable<any> {
    return this.http.put('system/user/resetPwd', { userId, password });
  }

  changeStatus(userId: number, status: string): Observable<any> {
    return this.http.put('system/user/changeStatus', { userId, status });
  }

  deptTree(): Observable<any> {
    return this.http.get('system/user/deptTree');
  }

  getAuthRole(userId: number | string): Observable<any> {
    return this.http.get('system/user/authRole/' + userId);
  }

  /** Nest 使用 @Query()，参数走 querystring */
  updateAuthRole(data: { userId: number | string; roleIds: string }): Observable<any> {
    return this.http.putWithParams('system/user/authRole', data, {});
  }

  getProfile(): Observable<any> {
    return this.http.get('system/user/profile');
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put('system/user/profile', data);
  }

  updatePwd(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put('system/user/profile/updatePwd', { oldPassword, newPassword });
  }

  /** multipart 头像上传 */
  uploadAvatar(file: File): Observable<any> {
    const form = new FormData();
    form.append('avatarfile', file);
    return this.httpClient.post(Config.API_URL + 'system/user/profile/avatar', form, { observe: 'body' });
  }

  /** 用户导入 */
  importData(file: File, updateSupport = false): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    const qs = updateSupport ? '?updateSupport=1' : '?updateSupport=0';
    return this.httpClient.post(Config.API_URL + 'system/user/importData' + qs, form, { observe: 'body' });
  }

  /** 下载导入模板（走 DownloadService POST importTemplate） */
}
