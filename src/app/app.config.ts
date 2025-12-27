import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { zh_CN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './http/auth.interceptor';
import { responseInterceptor } from './http/response.interceptor';
import { errorInterceptor } from './http/error.interceptor';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    // ssr
    // provideClientHydration(withEventReplay()), 
    provideNzIcons(icons), provideNzI18n(zh_CN), 
    provideAnimationsAsync(),
    // 注意：拦截器的执行顺序是从左到右
    // authInterceptor -> responseInterceptor -> errorInterceptor
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, responseInterceptor, errorInterceptor])),
    SafeHtmlPipe
  ]
};
