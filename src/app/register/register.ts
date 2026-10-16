import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { HttpClient } from '@angular/common/http';
import { Config } from '../http/config';
import { CaptchaService } from '../custom-form/captcha/captcha.service';
import { Captcha } from '../custom-form/captcha/captcha';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink, NzFormModule, NzInputModule, NzButtonModule, NzCardModule, Captcha],
  templateUrl: './register.html',
  styleUrl: './register.less',
})
export class Register implements OnInit {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private captchaService = inject(CaptchaService);

  enabled = signal(false);
  loading = false;
  form = { userName: '', password: '', confirmPassword: '', code: '' };

  ngOnInit(): void {
    this.http.get<any>(Config.API_URL + 'registerUser').subscribe({
      next: (res) => {
        this.enabled.set(!!res?.data);
        if (!res?.data) this.message.warning('当前系统没有开启注册功能');
      },
      error: () => this.enabled.set(false),
    });
  }

  submit(): void {
    if (!this.enabled()) {
      this.message.warning('当前系统没有开启注册功能');
      return;
    }
    if (!this.form.userName || this.form.userName.length < 2) {
      this.message.error('用户账号长度必须介于 2 和 20 之间');
      return;
    }
    if (!this.form.password || this.form.password.length < 5) {
      this.message.error('用户密码长度必须介于 5 和 20 之间');
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.message.error('两次输入的密码不一致');
      return;
    }
    if (!this.form.code) {
      this.message.error('请输入验证码');
      return;
    }
    this.loading = true;
    const uuid = this.captchaService.getUuid();
    this.http
      .post<any>(Config.API_URL + 'register', {
        userName: this.form.userName,
        password: this.form.password,
        code: this.form.code,
        uuid,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res?.code === 200) {
            this.message.success('注册成功');
            this.router.navigate(['/login']);
          } else {
            this.message.error(res?.msg || '注册失败');
          }
        },
        error: () => (this.loading = false),
      });
  }
}
