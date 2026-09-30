import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Config } from './config';

@Injectable({
  providedIn: 'root'
})
export class BaseHttp {
  constructor(private httpClient: HttpClient) {}

  /**
   * GET 请求
   * @param url 请求地址
   * @param params 请求参数
   * @returns Observable（直接返回body，与Vue项目保持一致）
   */
  public get(url: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.httpClient.get(Config.API_URL + url, { params: httpParams, observe: 'body' });
  }

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求数据
   * @returns Observable（直接返回body，与Vue项目保持一致）
   */
  public post(url: string, data?: any): Observable<any> {
    return this.httpClient.post(Config.API_URL + url, data, { observe: 'body' });
  }

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求数据
   * @returns Observable（直接返回body，与Vue项目保持一致）
   */
  public put(url: string, data?: any): Observable<any> {
    return this.httpClient.put(Config.API_URL + url, data, { observe: 'body' });
  }

  /** PUT 且参数走 query（Nest updateAuthRole 等） */
  public putWithParams(url: string, params?: any, data: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.httpClient.put(Config.API_URL + url, data, { params: httpParams, observe: 'body' });
  }

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param params 请求参数
   * @returns Observable（直接返回body，与Vue项目保持一致）
   */
  public delete(url: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.httpClient.delete(Config.API_URL + url, { params: httpParams, observe: 'body' });
  }
}
