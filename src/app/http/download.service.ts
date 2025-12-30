import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { NzLoadingService } from 'ng-zorro-antd/loading';
import { Config } from './config';
import { tansParams, blobValidate } from '../util/ruoyi.util';
import { ERROR_CODE } from '../util/error-code';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  // private loading = inject(NzLoadingService);

  /**
   * 通用下载方法
   * @param url 下载地址
   * @param params 请求参数
   * @param filename 文件名
   * @param config 额外配置
   */
  download(url: string, params?: any, filename?: string, config?: any): void {
    // 显示加载提示
    // const loadingRef = this.loading.create({
    //   nzContent: '正在下载数据，请稍候',
    //   nzMask: true
    // });

    // 处理参数
    let body: any;
    if (params) {
      const paramsStr = tansParams(params);
      body = paramsStr.slice(0, -1); // 去掉最后的&
    }

    // 发送请求
    (this.http.post(Config.API_URL + url, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      ...config
    }) as unknown as Observable<Blob>).pipe(
      catchError((error: any) => {
        // loadingRef.close();
        if (error.error instanceof Blob) {
          // 尝试解析错误信息
          error.error.text().then((text: string) => {
            try {
              const rspObj = JSON.parse(text);
              const errMsg = ERROR_CODE[rspObj.code] || rspObj.msg || ERROR_CODE['default'];
              this.message.error(errMsg);
            } catch (e) {
              this.message.error('下载文件出现错误，请联系管理员！');
            }
          });
        } else {
          this.message.error('下载文件出现错误，请联系管理员！');
        }
        throw error;
      })
    ).subscribe({
      next: async (data: any) => {
        // loadingRef.close();
        const isBlob = blobValidate(data);
        if (isBlob) {
          // 保存文件（使用浏览器原生方式）
          const blob = new Blob([data]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || `download_${new Date().getTime()}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          // 尝试解析错误信息
          const resText = await data.text();
          try {
            const rspObj = JSON.parse(resText);
            const errMsg = ERROR_CODE[rspObj.code] || rspObj.msg || ERROR_CODE['default'];
            this.message.error(errMsg);
          } catch (e) {
            this.message.error('下载文件出现错误，请联系管理员！');
          }
        }
      },
      error: (error) => {
        // loadingRef.close();
        console.error('Download error:', error);
      }
    });
  }

  /**
   * 下载文件（Observable方式）
   * @param url 下载地址
   * @param params 请求参数
   * @param config 额外配置
   * @returns Observable<Blob>
   */
  downloadObservable(url: string, params?: any, config?: any): Observable<Blob> {
    let body: any;
    if (params) {
      const paramsStr = tansParams(params);
      body = paramsStr.slice(0, -1);
    }

    return this.http.post(Config.API_URL + url, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      ...config
    }).pipe(
      catchError((error: any) => {
        console.error('Download error:', error);
        throw error;
      })
    ) as unknown as Observable<Blob>;
  }
}

