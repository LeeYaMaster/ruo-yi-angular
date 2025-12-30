import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { StorageService } from '../util/storage.service';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';

const TokenKey = 'Admin-Token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);

  // 处理 CORS 跨域请求的 OPTIONS 预检，不添加 Authorization 头
  if (req.method === 'OPTIONS') {
    return next(req);
  }

  // 获取自定义header，判断是否需要设置token
  const isToken = (req.headers.get('isToken') || '') !== 'false';
  
  // 判断是否需要防止数据重复提交
  const isRepeatSubmit = (req.headers.get('repeatSubmit') || '') !== 'false';

  // 处理POST/PUT请求的防重复提交
  if (!isRepeatSubmit && (req.method === 'POST' || req.method === 'PUT')) {
    const requestObj = {
      url: req.url,
      data: typeof req.body === 'object' ? JSON.stringify(req.body) : req.body,
      time: new Date().getTime()
    };
    const sessionObj = storageService.session.getJSON('sessionObj');
    if (sessionObj) {
      const s_url = sessionObj.url;
      const s_data = sessionObj.data;
      const s_time = sessionObj.time;
      const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        console.warn(`[${requestObj.url}]: 数据正在处理，请勿重复提交`);
        return throwError(() => new Error('数据正在处理，请勿重复提交'));
      }
    }
    storageService.session.setJSON('sessionObj', requestObj);
  }

  // 获取token
  const token = storageService.get(TokenKey);

  // 克隆请求，设置headers
  let clonedReq: HttpRequest<any> = req.clone({
    setHeaders: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  });

  // 如果需要token且存在token，则添加Authorization头
  if (token && isToken) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq);
};
