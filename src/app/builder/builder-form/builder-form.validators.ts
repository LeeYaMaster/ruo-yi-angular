import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * 大陆手机号同步验证器
 * 规则：1[3-9]\d{9}
 */
export const phoneValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;                  // 空值交给 required 处理
    const phoneReg = /^1[3-9]\d{9}$/;
    return phoneReg.test(value) ? null : { phone: true };
  };
};

/* ****** 交叉校验函数 ****** */
export const confirmPasswordValidator = (passwordField: string, confirmField: string): any => {
  return (form: FormGroup) => {
    const pass = form.get(passwordField)?.value;
    const confirm = form.get(confirmField)?.value;
    if (!pass || !confirm) return null;
    return pass === confirm ? null : { mismatch: true };
  };
}