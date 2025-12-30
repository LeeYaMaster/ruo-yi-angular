import { HttpErrorResponse, HttpInterceptorFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * HTTP错误拦截器
 * 处理HTTP层面的错误（网络错误、HTTP状态码错误等）
 */
export const errorInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  const message = inject(NzMessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      // 处理HTTP错误
      if (error.error instanceof ErrorEvent) {
        // 客户端错误
        errorMessage = error.error.message;
      } else {
        // 处理网络错误
        if (error.status === 0) {
          if (error.error instanceof ProgressEvent) {
            errorMessage = '后端接口连接异常';
          } else {
            errorMessage = '网络错误，请检查网络连接';
          }
        } else if (error.message && error.message.includes('timeout')) {
          errorMessage = '系统接口请求超时';
        } else if (error.message && error.message.includes('Request failed with status code')) {
          const statusCode = error.status || '未知';
          errorMessage = `系统接口${statusCode}异常`;
        } else {
          errorMessage = `请求失败：${error.status} ${error.statusText}`;
        }
      }

      if (errorMessage) {
        message.error(errorMessage, { nzDuration: 5000 });
      }

      return throwError(() => error);
    })
  );
};

