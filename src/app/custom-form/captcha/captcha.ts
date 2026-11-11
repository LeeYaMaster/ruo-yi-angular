import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CaptchaApiService } from './captcha.api.service';
import { CaptchaService } from './captcha.service';

@Component({
  selector: 'app-captcha',
  imports: [],
  templateUrl: './captcha.html',
  styleUrl: './captcha.less',
})
export class Captcha {
  private captchaApiService = inject(CaptchaApiService);
  private captchaService = inject(CaptchaService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  captchaUrl = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getCaptchaUrl();
    }
  }

  getCaptchaUrl(): void {
    this.captchaApiService.getCode().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const img = payload?.img ?? '';
        const uuid = payload?.uuid ?? '';
        this.captchaService.setUuid(uuid);
        this.captchaUrl = this.toImageSrc(img);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.captchaUrl = '';
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  refreshCaptcha(): void {
    this.getCaptchaUrl();
  }

  private toImageSrc(img: string): string {
    if (!img) {
      return '';
    }
    if (img.startsWith('data:') || img.startsWith('blob:') || img.startsWith('http')) {
      return img;
    }
    if (img.includes('<svg')) {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(img);
    }
    return 'data:image/png;base64,' + img;
  }
}
