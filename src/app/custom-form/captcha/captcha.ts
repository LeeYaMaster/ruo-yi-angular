import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CaptchaApiService } from './captcha.api.service';
import { SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../pipe/safe-html.pipe';
import { fromEvent, tap, throttleTime } from 'rxjs';
import { CaptchaService } from './captcha.service';

@Component({
  selector: 'app-captcha',
  imports: [SafeHtmlPipe],
  templateUrl: './captcha.html',
  styleUrl: './captcha.less',
})
export class Captcha {
  private captchaApiService = inject(CaptchaApiService);
  private captchaService = inject(CaptchaService);
  @ViewChild('captchaRef') captchaRef!: ElementRef;
  captchaUrl: string = '';
  uuid: string = ''
  private cdr = inject(ChangeDetectorRef);
  ngOnInit(): void {
    console.log('Captcha ngOnInit');
    this.getCaptchaUrl();
  }

  ngAfterViewInit(): void {
    fromEvent(this.captchaRef.nativeElement, 'click')
      .pipe(
        throttleTime(1000))
      .subscribe(() => {
        this.getCaptchaUrl();
      });
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
