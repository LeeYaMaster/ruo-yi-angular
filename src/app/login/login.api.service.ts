import { inject, Injectable } from '@angular/core';
import { BaseHttp } from '../http/http';
import { Observable } from 'rxjs';

export interface requestLogin {
  code: string;
  password: string;
  userName: string;
  uuid: string;
}

export interface responseLogin {
  msg: string;
  code: number;
  data: {
    token: string;
  };
}


@Injectable({
  providedIn: 'root',
})
export class LoginApiService {
  baseHttp = inject(BaseHttp);
  login(data: requestLogin): Observable<responseLogin> {
    return this.baseHttp.post('login', data) as Observable<responseLogin>;
  }
}
