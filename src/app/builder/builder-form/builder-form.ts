import { Component, inject, Input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
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
  customValidators: any;


  ngOnInit(): void {
    console.log(this.formConfig);
    
    this.formConfig.forEach(item => {
      const validators = Array.isArray(item.rules)
        ? item.rules.map(rule => this.mapRule(rule))
        : [];
      this.validateForm.addControl(item.name, this.fb.control(item.value ?? '', validators));
    });
  }
  // todo 自定义验证器，range，len，双验证器
  mapRule(rule: any): ValidatorFn {
    switch (rule.type) {
      case 'required':
        return Validators.required;
      case 'minLength':
        return Validators.minLength(rule.len);
      case 'maxLength':
        return Validators.maxLength(rule.len);
      // case 'range':
      //   return (Validators.compose([
      //     Validators.min(rule.value[0]),
      //     Validators.max(rule.value[1])
      //   ]) ?? Validators.nullValidator);
      // case 'custom':
      //   return this.customValidators[rule.validator!]; // 运行时注入
      default:
        return Validators.nullValidator;
    }
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
