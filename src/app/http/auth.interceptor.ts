import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../util/storage.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.get('token');

  // 处理 CORS 跨域请求的 OPTIONS 预检，不添加 Authorization 头
  if (req.method === 'OPTIONS') {
    return next(req);
  }

  if (!token) return next(req);

  // 克隆请求并附加头
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // 这里可以刷新 token 或跳登录
        console.warn('401 触发刷新流程');
      }
      // 跨域错误提示（如 CORS 阻止了请求）
      if (err.status === 0 && err.error instanceof ProgressEvent) {
        console.error('可能的 CORS 跨域问题，请检查服务器允许的来源和请求头。');
      }
      return throwError(() => err);
    })
  );
};
