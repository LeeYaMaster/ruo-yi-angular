import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { LoginApiService } from './login.api.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NzButtonModule, NzCheckboxModule, NzFormModule, NzInputModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private loginApiService = inject(LoginApiService);
  private fb = inject(NonNullableFormBuilder);
  captchaUrl = '';
  ngOnInit(): void {
    this.getCaptchaUrl();
  }

  getCaptchaUrl(): void {
    this.loginApiService.getCode().subscribe(res => {
      console.log(res)
      this.captchaUrl = res.img;
    });
  }

  refreshCaptcha(): void {
    this.getCaptchaUrl();
  }
  validateForm = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
    captcha: this.fb.control('', [Validators.required])
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
