import { Component, inject, Input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Captcha } from '../../custom-form/captcha/captcha';
import { FormConfig } from './builder-form.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-builder-form',
  imports: [ReactiveFormsModule, NzButtonModule, 
    NzCheckboxModule, NzFormModule, NzInputModule, Captcha, CommonModule],
  templateUrl: './builder-form.html',
  styleUrl: './builder-form.less',
})
export class BuilderForm {
  @Input() formConfig: FormConfig = [];
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({});


  ngOnInit(): void {
    console.log(this.formConfig);
    
    this.formConfig.forEach(item => {
      // 之前代码未正确提取 validator，应为 rule.validator
      const validators = Array.isArray(item.rules)
        ? item.rules.map(rule => rule.validator)
        : [];
      this.validateForm.addControl(item.name, this.fb.control(item.value ?? '', validators));
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      // 过滤掉 when 不满足的项，只保留展示的项数据
      const filteredValue = Object.fromEntries(
        this.formConfig
          .filter(item => !item.when || item.when(this.validateForm.value))
          .map(item => [item.name, (this.validateForm.value as any)[item.name]])
      );
      console.log('submit', filteredValue);
    } else {
      console.log('validateForm', this.validateForm);
      Object.values(this.validateForm.controls).forEach((control: any) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
