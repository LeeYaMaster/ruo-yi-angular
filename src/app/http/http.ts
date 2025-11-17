import {Injectable} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Config} from './config';
import {Router} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class baseHttp {
  constructor(
    // public msg: NzMessageService, 
    public httpClient: HttpClient, 
    private router: Router) {

  }

  public get(url: string, data: object): Observable<any> {
    return this.httpClient.get(Config.API_URL + url, {
      params: {
        ...data
      },
    });
  }
  // headers: {
  //   'content-type': 'application/x-www-form-urlencoded'
  // }
  // if (result.data.msg === '您没有权限访问当前地址') {
  //   this.msg.error(result.data.msg);
  // }
  // if (result.data.msg === '请您登录') {
  //   this.msg.error('Session过期，请重新登录');
  //   this.router.navigate(['login']);
  // }

  // public async post(url: string, data: object) {
  //   const d = qs.stringify(data);
  //   const result: object = await this.httpClient.post(Config.API_URL + url, d, {
  //     headers: {'content-type': 'application/x-www-form-urlencoded'},
  //   });
  //   if (result.data.msg === '您没有权限访问当前地址') {
  //     this.msg.error(result.data.msg);
  //   }
  //   if (result.data.msg === '请您登录') {
  //     this.msg.error('Session过期，请重新登录');
  //     this.router.navigate(['login']);
  //   }
  //   return result;
  // }

  // public async put(url: string, data: object) {
  //   // put 有问题，参数不能在url上面。
  //   let str = '?';
  //   for (let key in data) {
  //     str += `${key}=${data[key]}&`;
  //   }
  //   const result: object = await this.httpClient.put(Config.API_URL + url + str);
  //   if (result.data.msg === '您没有权限访问当前地址') {
  //     this.msg.error(result.data.msg);
  //   }
  //   if (result.data.msg === '请您登录') {
  //     this.msg.error('Session过期，请重新登录');
  //     this.router.navigate(['login']);
  //   }
  //   return result;
  // }

  // public async delete(url: string, data: object) {
  //   const result: object = await this.httpClient.delete(Config.API_URL + url, {
  //     params: {
  //       ...data
  //     },
  //     headers: {
  //       'content-type': 'application/x-www-form-urlencoded'
  //     }
  //   });
  //   if (result.data.msg === '您没有权限访问当前地址') {
  //     this.msg.error(result.data.msg);
  //   }
  //   if (result.data.msg === '请您登录') {
  //     this.msg.error('Session过期，请重新登录');
  //     this.router.navigate(['login']);
  //   }
  //   return result;
  // }

  // public upload(url: string, param: object, callbackFun) {
  //   this.httpClient.post(Config.API_URL + url, param, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         // 'token': localStorage.getItem('token')
  //       },
  //     })
  //     .then((result) => {
  //       return callbackFun(result.data);
  //     })
  //     .catch((error) => {
  //       return callbackFun(error.data);
  //     });
  // }
}

interface ValueObject {
  status?: number;
}
