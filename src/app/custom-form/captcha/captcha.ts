import { Component, inject } from '@angular/core';
import { CaptchaApiService } from './captcha.api.service';

@Component({
  selector: 'app-captcha',
  imports: [],
  templateUrl: './captcha.html',
  styleUrl: './captcha.less',
})
export class Captcha {
  private captchaApiService = inject(CaptchaApiService);
  captchaUrl = '';
  
  ngOnInit(): void {
    this.getCaptchaUrl();
  }

  getCaptchaUrl(): void {
    this.captchaApiService.getCode().subscribe((res) => {
      console.log(res);
      this.captchaUrl = res.img;
    });
  }

  refreshCaptcha(): void {
    this.getCaptchaUrl();
  }
}
