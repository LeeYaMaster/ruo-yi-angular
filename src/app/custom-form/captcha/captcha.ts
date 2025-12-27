import { ChangeDetectorRef, Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CaptchaApiService } from './captcha.api.service';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { fromEvent, throttleTime } from 'rxjs';
import { CaptchaService } from './captcha.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-captcha',
  imports: [SafeHtmlPipe],
  templateUrl: './captcha.html',
  styleUrl: './captcha.less',
})
export class Captcha {
  private captchaApiService = inject(CaptchaApiService);
  private captchaService = inject(CaptchaService);
  private platformId = inject(PLATFORM_ID);
  @ViewChild('captchaRef') captchaRef!: ElementRef;
  captchaUrl: string = '';
  uuid: string = ''
  private cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    console.log('Captcha ngOnInit');
    // 只在浏览器端调用 API，避免 SSR 环境下的 URL 解析错误
    if (isPlatformBrowser(this.platformId)) {
      this.getCaptchaUrl();
    }
  }

  ngAfterViewInit(): void {
    // 只在浏览器端绑定事件监听器，避免 SSR 环境下的错误
    if (isPlatformBrowser(this.platformId) && this.captchaRef?.nativeElement) {
      fromEvent(this.captchaRef.nativeElement, 'click')
        .pipe(
          throttleTime(1000))
        .subscribe(() => {
          this.getCaptchaUrl();
        });
    }
  }

  getCaptchaUrl(): void {
    this.captchaApiService.getCode().subscribe((res) => {
      // console.log(res);
      this.captchaUrl = res.data.img;
      this.captchaService.setUuid(res.data.uuid);
      this.cdr.detectChanges();
    });
  }

  refreshCaptcha(): void {
    this.getCaptchaUrl();
  }
}
