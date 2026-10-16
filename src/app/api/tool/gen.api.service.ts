import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../http/config';

@Injectable({ providedIn: 'root' })
export class GenApiService {
  private http = inject(BaseHttp);
  private httpClient = inject(HttpClient);

  list(query?: any): Observable<any> {
    return this.http.get('tool/gen/list', query);
  }

  dbList(query?: any): Observable<any> {
    return this.http.get('tool/gen/db/list', query);
  }

  get(tableId: number | string): Observable<any> {
    return this.http.get('tool/gen/' + tableId);
  }

  update(data: any): Observable<any> {
    return this.http.put('tool/gen', data);
  }

  importTable(tableNames: string): Observable<any> {
    return this.http.post('tool/gen/importTable', { tableNames });
  }

  preview(tableId: number | string): Observable<any> {
    return this.http.get('tool/gen/preview/' + tableId);
  }

  remove(tableId: number | string): Observable<any> {
    return this.http.delete('tool/gen/' + tableId);
  }

  /** 自定义路径生成 */
  genCode(tableName: string): Observable<any> {
    return this.http.get('tool/gen/genCode/' + tableName);
  }

  synchDb(tableName: string): Observable<any> {
    return this.http.get('tool/gen/synchDb/' + tableName);
  }

  /** zip 下载（GET blob） */
  downloadZip(tableNames: string): Observable<Blob> {
    return this.httpClient.get(Config.API_URL + 'tool/gen/batchGenCode/zip', {
      params: { tableNames },
      responseType: 'blob',
    });
  }
}
