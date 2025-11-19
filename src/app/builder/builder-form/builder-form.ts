import { Component, computed, inject, Input } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { Captcha } from '../../custom-form/captcha/captcha';
import { ErrorMessage, FormConfig, GroupValidator, RulesKey } from './builder-form.model';
import { CommonModule } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { phoneValidator } from './builder-form.validators';

@Component({
  selector: 'app-builder-form',
  imports: [ReactiveFormsModule, NzButtonModule, 
    NzCheckboxModule, NzFormModule, NzInputModule, Captcha, CommonModule,
    ],
  templateUrl: './builder-form.html',
  styleUrl: './builder-form.less',
})
export class BuilderForm {
  @Input() formConfig: FormConfig = [];
  @Input() groupValidators: GroupValidator[] = [];
  private fb = inject(NonNullableFormBuilder);
  private notification = inject(NzNotificationService);
  validateForm = this.fb.group({});

  getErrorsMessage(control: AbstractControl, errorMessage: ErrorMessage = {}): string[] {
    return Object.keys(control.errors ?? {})
    .map(key => errorMessage?.[key as RulesKey] ?? '');
  }

  // 监听页面值变化，根据 when 过滤对应验证器
  ngAfterViewInit(): void {
    this.validateForm.valueChanges.subscribe(formValue => {
      this.clearAllHideControls(formValue);
    });
  }

  clearAllHideControls(formValue: any): void {
    this.formConfig.forEach(item => {
      const control = this.validateForm.get(item.name);
      if (!control) return;
      const show = !item.when || item.when(formValue);
      if (show) {
        // 如果应该显示，确保有校验规则
        const validators =
          Object.entries(item.rules ?? {}).map(([key, value]) => this.mapRule(key, value)) || {};
        control.setValidators(validators);
      } else {
        // 如果不显示，移除所有校验规则，并清空错误
        control.clearValidators();
        control.setErrors(null);
      }
      control.updateValueAndValidity({ onlySelf: true });
    });
  }



  ngOnInit(): void {
    console.log(this.formConfig);
    
    this.formConfig.forEach(item => {
      const validators = 
        Object.entries(item.rules ?? {}).map(([key, value]) => this.mapRule(key, value))
        || {};
      this.validateForm.addControl(item.name, this.fb.control(item.defaultValue ?? '', validators));
    });
    this.clearAllHideControls(this.validateForm.value);
  }
  // todo 双验证器
  mapRule(key: string, value: any): ValidatorFn {
    switch (key) {
      case 'required':
        return value ? Validators.required : Validators.nullValidator;
      case 'minlength':
        return value ? Validators.minLength(value) : Validators.nullValidator;
      case 'maxlength':
        return value ? Validators.maxLength(value) : Validators.nullValidator;
      case 'custom':
        if(value.includes('phone')) {
          return phoneValidator();
        }
        return Validators.nullValidator;
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
      Object.entries(this.validateForm.controls).forEach(([key, control]: [string, any]) => {
        if (control.invalid) {
       
          console.log('control', control.errors);


          const currentFormConfig = this.formConfig.find(item => item.name === key);
          this.getErrorsMessage(control, currentFormConfig?.errorMessage).forEach(errorMessage => {
            this.notification.create(
              'error',
              'Form Validation Error',
              errorMessage
            );
          });

          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
