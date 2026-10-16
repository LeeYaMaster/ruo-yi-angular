import { Component, inject } from '@angular/core';

import { LoginApiService } from './login.api.service';
import { BuilderForm } from '../builder/builder-form/builder-form';
import { FormConfig } from '../builder/builder-form/builder-form.model';
import { Captcha} from '../custom-form/captcha/captcha';
import { CaptchaService } from '../custom-form/captcha/captcha.service';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../util/storage.service';
import { TokenKey } from '../util/auth.util';
import { AuthService } from '../auth/auth.service';
import { PagesApiService } from '../dashboard/pages.api.service';

@Component({
  selector: 'app-login',
  imports: [BuilderForm, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private loginApiService = inject(LoginApiService);
  private captchaService = inject(CaptchaService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  private pagesApi = inject(PagesApiService);
  ngOnInit(): void {
    const uuid = this.captchaService.getUuid()
    console.log(uuid);
  }
  submitForm(event: any): void {
    console.log(event);
    const uuid = this.captchaService.getUuid()
    this.loginApiService.login({...event, uuid}).subscribe((res) => {
      if (res.code === 200) {
        this.storageService.set(TokenKey, res.data.token);
        this.pagesApi.getInfo().subscribe({
          next: (info) => {
            this.authService.setFromGetInfo(info);
            this.router.navigate(['/system/welcome']);
          },
          error: () => this.router.navigate(['/system/welcome']),
        });
      } else {
        this.message.error(res.msg);
      }
    });
  }
  formConfig: FormConfig = [
    {
      name: 'userName',
      component: 'input',
      label: 'Username',
      placeholder: 'Enter your username',
      rules: {
        required: true,
      },
      errorMessage: {
        required: 'Please input your username',
      },
      defaultValue: '',
    },
    {
      name: 'password',
      component: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      rules: {
        required: true,
      },
      errorMessage: {
        required: 'Please input your password',
      },
    },
    {
      name: 'code',
      component: 'custom',
      customComponent: Captcha,
      label: 'Captcha',
      placeholder: 'Enter your captcha',
      rules: {
        required: true,
      },
      errorMessage: {
        required: 'Please input your captcha',
      },
    }
  ];
}
