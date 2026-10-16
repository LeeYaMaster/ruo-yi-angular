import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ErrorMessage, FormConfig, GroupValidator, RulesKey } from './builder-form.model';
import { CommonModule } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { confirmPasswordValidator, phoneValidator } from './builder-form.validators';
import { RichEditor } from '../../shared/rich-editor/rich-editor';

@Component({
  selector: 'app-builder-form',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzRadioModule,
    NzInputNumberModule,
    NzIconModule,
    NzGridModule,
    CommonModule,
    RichEditor,
  ],
  templateUrl: './builder-form.html',
  styleUrl: './builder-form.less',
})
export class BuilderForm implements OnChanges {
  @Input() formConfig: FormConfig = [];
  @Input() groupValidators: GroupValidator[] = [];
  /** login | vertical — login keeps icon-prefix style without labels */
  @Input() layout: 'login' | 'vertical' | 'horizontal' = 'login';
  @Input() submitText = '提交';
  @Input() showSubmit = true;
  @Input() labelSpan = 6;
  @Input() controlSpan = 16;
  @Output() submitFormEvent = new EventEmitter<any>();

  private fb = inject(NonNullableFormBuilder);
  private notification = inject(NzNotificationService);
  validateForm = this.fb.group({});
  private built = false;

  getControlErrorsMessage(control: AbstractControl, errorMessage: ErrorMessage = {}): string[] {
    return Object.keys(control.errors ?? {}).map((key) => errorMessage?.[key as RulesKey] ?? '');
  }

  getFormErrorsMessage(): string {
    const errorsKeys = Object.keys(this.validateForm.errors ?? {});
    const arr = errorsKeys.map(
      (key) => this.groupValidators.find((item) => item.errorKey === key)?.message ?? ''
    );
    return arr.join('\n');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && this.formConfig?.length) {
      this.buildForm();
    }
  }

  ngOnInit(): void {
    if (!this.built && this.formConfig?.length) {
      this.buildForm();
    }
    this.validateForm.valueChanges.subscribe((formValue) => {
      this.clearAllHideControls(formValue);
    });
  }

  private buildForm(): void {
    const next = this.fb.group({});
    this.formConfig.forEach((item) => {
      const validators =
        Object.entries(item.rules ?? {}).map(([key, value]) => this.getRuleValidator(key, value)) ||
        [];
      const ctrl = this.fb.control(
        { value: item.defaultValue ?? (item.component === 'number' ? 0 : ''), disabled: !!item.disabled },
        validators.flat()
      );
      next.addControl(item.name, ctrl);
    });
    this.groupValidators?.forEach((g) => {
      if (g.validator === 'confirmPassword') {
        next.setValidators(confirmPasswordValidator(g.fields[0], g.fields[1]));
      }
    });
    this.validateForm = next;
    this.built = true;
    this.clearAllHideControls(this.validateForm.value);
  }

  clearAllHideControls(formValue: any): void {
    this.formConfig.forEach((item) => {
      const control = this.validateForm.get(item.name);
      if (!control) return;
      const show = !item.when || item.when(formValue);
      if (show) {
        const validators =
          Object.entries(item.rules ?? {}).map(([key, value]) => this.getRuleValidator(key, value)) ||
          [];
        control.setValidators(validators.flat());
      } else {
        control.clearValidators();
        control.setErrors(null);
      }
      control.updateValueAndValidity({ onlySelf: true });
    });
  }

  getRuleValidator(key: string, value: any): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    const validatorMap: { [k: string]: (value: any) => ValidatorFn | ValidatorFn[] } = {
      required: (v) => (v ? Validators.required : Validators.nullValidator),
      minlength: (v) => (v ? Validators.minLength(v) : Validators.nullValidator),
      maxlength: (v) => (v ? Validators.maxLength(v) : Validators.nullValidator),
      custom: (v) => {
        const arr: ValidatorFn[] = [];
        if (Array.isArray(v) && v.includes('phone')) {
          arr.push(phoneValidator());
        }
        return arr.length ? arr : Validators.nullValidator;
      },
    };

    if (validatorMap[key]) {
      const result = validatorMap[key](value);
      if (Array.isArray(result)) {
        validators.push(...result);
      } else {
        validators.push(result);
      }
    } else {
      return [Validators.nullValidator];
    }
    return validators.length ? validators : [Validators.nullValidator];
  }

  /** Patch values after open edit modal */
  patchValue(value: Record<string, any>): void {
    this.validateForm.patchValue(value ?? {});
  }

  reset(value?: Record<string, any>): void {
    this.validateForm.reset(value ?? {});
  }

  getRawValue(): any {
    return this.validateForm.getRawValue();
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const filteredValue = Object.fromEntries(
        this.formConfig
          .filter((item) => !item.when || item.when(this.validateForm.value))
          .map((item) => [item.name, (this.validateForm.getRawValue() as any)[item.name]])
      );
      this.submitFormEvent.emit(filteredValue);
    } else {
      Object.entries(this.validateForm.controls).forEach(([key, control]: [string, any]) => {
        if (control.invalid) {
          const currentFormConfig = this.formConfig.find((item) => item.name === key);
          this.getControlErrorsMessage(control, currentFormConfig?.errorMessage).forEach(
            (errorMessage) => {
              if (errorMessage) {
                this.notification.create('error', '表单校验失败', errorMessage);
              }
            }
          );
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
