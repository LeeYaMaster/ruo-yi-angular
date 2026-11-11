import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ERROR_CODE } from '../util/error-code';
import { TokenKey } from '../util/auth.util';

// 是否显示重新登录（防止重复弹窗）
let isRelogin = { show: false };

/**
 * 响应拦截器：只处理 HttpResponse，必须把 HttpResponse 原样交回给 HttpClient。
 * 之前直接 return body，在 withFetch() 下请求不会完成，登录页验证码也就出不来。
 */
export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const message = inject(NzMessageService);
  const notification = inject(NzNotificationService);

  return next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      if (req.responseType === 'blob' || req.responseType === 'arraybuffer') {
        return event;
      }

      const responseData = event.body as { code?: number; msg?: string } | null;
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        const code = Number(responseData.code ?? 200);
        const msg = ERROR_CODE[String(code)] || responseData.msg || ERROR_CODE['default'];

        if (code === 401) {
          if (!isRelogin.show) {
            isRelogin.show = true;
            const errorMsg = responseData.msg || '登录已过期，请重新登录';
            message.error(errorMsg);
            localStorage.removeItem(TokenKey);
            router.navigate(['/login']);
            setTimeout(() => {
              isRelogin.show = false;
            }, 1000);
          }
          throw new HttpErrorResponse({
            error: { code: 401, msg: responseData.msg || '登录已过期，请重新登录' },
            status: 401,
            statusText: 'Unauthorized',
          });
        } else if (code === 500) {
          message.error(msg);
          throw new HttpErrorResponse({
            error: { code: 500, msg },
            status: 500,
            statusText: 'Internal Server Error',
          });
        } else if (code === 601) {
          message.warning(msg);
          throw new HttpErrorResponse({
            error: { code: 601, msg },
            status: 601,
            statusText: 'Warning',
          });
        } else if (code !== 200) {
          notification.error('错误', msg);
          throw new HttpErrorResponse({
            error: { code, msg },
            status: code,
            statusText: 'Error',
          });
        }
      }

      return event;
    }),
    catchError((error) => {
      return throwError(() => error);
    }),
  );
};
