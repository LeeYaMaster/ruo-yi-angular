import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ERROR_CODE } from '../util/error-code';

// 是否显示重新登录（防止重复弹窗）
let isRelogin = { show: false };

/**
 * 响应拦截器
 * 处理业务错误码（当使用observe: 'body'时，这里接收到的是body对象）
 */
export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const message = inject(NzMessageService);
  const notification = inject(NzNotificationService);

  return next(req).pipe(
    map((body: any) => {
      // 二进制数据直接返回
      if (req.responseType === 'blob' || req.responseType === 'arraybuffer') {
        return body;
      }

      // 检查业务错误码
      if (body && typeof body === 'object' && 'code' in body) {
        const code = body.code || 200;
        const msg = ERROR_CODE[code] || body.msg || ERROR_CODE['default'];

        if (code === 401) {
          // 认证失败
          if (!isRelogin.show) {
            isRelogin.show = true;
            const shouldRelogin = confirm('登录状态已过期，您可以继续留在该页面，或者重新登录');
            isRelogin.show = false;
            if (shouldRelogin) {
              localStorage.removeItem('Admin-Token');
              router.navigate(['/login']);
            }
          }
          throw new HttpErrorResponse({
            error: { code: 401, msg: '无效的会话，或者会话已过期，请重新登录。' },
            status: 401,
            statusText: 'Unauthorized'
          });
        } else if (code === 500) {
          // 服务器内部错误
          message.error(msg);
          throw new HttpErrorResponse({
            error: { code: 500, msg },
            status: 500,
            statusText: 'Internal Server Error'
          });
        } else if (code === 601) {
          // 警告提示
          message.warning(msg);
          throw new HttpErrorResponse({
            error: { code: 601, msg },
            status: 601,
            statusText: 'Warning'
          });
        } else if (code !== 200) {
          // 其他错误
          notification.error('错误', msg);
          throw new HttpErrorResponse({
            error: { code, msg },
            status: code,
            statusText: 'Error'
          });
        }
      }

      // 成功响应，直接返回body
      return body;
    }),
    catchError((error) => {
      return throwError(() => error);
    })
  );
};
