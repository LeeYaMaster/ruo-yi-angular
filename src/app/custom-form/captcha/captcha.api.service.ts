import { inject, Injectable } from '@angular/core';
import { BaseHttp } from '../../http/http';
@Injectable({
  providedIn: 'root',
})
export class CaptchaApiService {
  baseHttp = inject(BaseHttp);
  getCode() {
    return this.baseHttp.get('captchaImage', {});
  }
}
