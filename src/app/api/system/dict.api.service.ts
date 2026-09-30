import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttp } from '../../http/http';

@Injectable({ providedIn: 'root' })
export class DictApiService {
  private http = inject(BaseHttp);

  listType(query?: any): Observable<any> {
    return this.http.get('system/dict/type/list', query);
  }

  getType(dictId: number | string): Observable<any> {
    return this.http.get('system/dict/type/' + dictId);
  }

  addType(data: any): Observable<any> {
    return this.http.post('system/dict/type', data);
  }

  updateType(data: any): Observable<any> {
    return this.http.put('system/dict/type', data);
  }

  removeType(dictId: number | string): Observable<any> {
    return this.http.delete('system/dict/type/' + dictId);
  }

  refreshCache(): Observable<any> {
    return this.http.delete('system/dict/type/refreshCache');
  }

  optionselect(): Observable<any> {
    return this.http.get('system/dict/type/optionselect');
  }

  listData(query?: any): Observable<any> {
    return this.http.get('system/dict/data/list', query);
  }

  getData(dictCode: number | string): Observable<any> {
    return this.http.get('system/dict/data/' + dictCode);
  }

  getDicts(dictType: string): Observable<any> {
    return this.http.get('system/dict/data/type/' + dictType);
  }

  addData(data: any): Observable<any> {
    return this.http.post('system/dict/data', data);
  }

  updateData(data: any): Observable<any> {
    return this.http.put('system/dict/data', data);
  }

  removeData(dictCode: number | string): Observable<any> {
    return this.http.delete('system/dict/data/' + dictCode);
  }
}
