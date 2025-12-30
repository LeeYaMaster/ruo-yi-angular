import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
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
 * 响应拦截器
 * 处理业务错误码（当使用observe: 'body'时，这里接收到的是body对象）
 */
export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const message = inject(NzMessageService);
  const notification = inject(NzNotificationService);

  // 调试信息：说明 req.body 和响应数据的区别
  // req.body 是请求体（发送给服务器的数据）
  // - GET 请求：req.body 为 null（GET 请求没有请求体）
  // - POST/PUT 请求：req.body 是发送的数据
  console.log('=== 响应拦截器调试信息 ===');
  console.log('请求方法:', req.method);
  console.log('请求URL:', req.url);
  console.log('请求体 req.body:', req.body); // GET 请求时为 null，这是正常的！
  console.log('注意：响应数据在 map((body) => {...}) 的 body 参数中，不在 req.body 中');

  return next(req).pipe(
    map((body: any) => {
      // 响应数据在这里！这是服务器返回的数据
      console.log('响应体 body (服务器返回的数据):', body);
      
      // 处理嵌套 body 的情况：如果 body.body 存在，使用它
      let responseData = body;
      if (body && typeof body === 'object' && 'body' in body && body.body !== null && body.body !== undefined) {
        console.log('检测到嵌套 body，使用 body.body:', body.body);
        responseData = body.body;
      }
      
      // 二进制数据直接返回
      if (req.responseType === 'blob' || req.responseType === 'arraybuffer') {
        return body;
      }
      // 检查业务错误码（使用处理后的 responseData）
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        const code = responseData.code || 200;
        
        const msg = ERROR_CODE[code] || responseData.msg || ERROR_CODE['default'];
        
        if (code === 401) {
          // 认证失败 - 登录已过期
          if (!isRelogin.show) {
            isRelogin.show = true;
            // 显示错误提示
            const errorMsg = responseData.msg || '登录已过期，请重新登录';
            message.error(errorMsg);
            // 清除 token
            localStorage.removeItem(TokenKey);
            // 跳转到登录页
            router.navigate(['/login']);
            // 延迟重置标志，防止短时间内重复弹窗
            setTimeout(() => {
              isRelogin.show = false;
            }, 1000);
          }
          throw new HttpErrorResponse({
            error: { code: 401, msg: responseData.msg || '登录已过期，请重新登录' },
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

      // 成功响应，返回处理后的数据（如果有嵌套 body，返回内层的 body，否则返回原始 body）
      return responseData;
    }),
    catchError((error) => {
      return throwError(() => error);
    })
  );
};
