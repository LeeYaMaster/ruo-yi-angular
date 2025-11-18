import { Injectable } from '@angular/core';
import { baseHttp } from '../../http/http';
@Injectable({
  providedIn: 'root',
})
export class CaptchaApiService {
  constructor(private baseHttp: baseHttp) {}
  getCode() {
    return this.baseHttp.get('captchaImage', {});
  }
}
