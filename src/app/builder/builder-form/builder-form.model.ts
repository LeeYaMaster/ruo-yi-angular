import { Type } from '@angular/core';

type BuiltInErrorKey =
  | 'required'
  | 'email'
  | 'min'
  | 'max'
  | 'minlength'
  | 'maxlength'
  | 'pattern'
  | 'nullValidator';
export type RulesKey = BuiltInErrorKey | 'custom';

export type ErrorMessage = {
  [key: string]: string;
};

export type FormOption = { label: string; value: any };

export type FormConfigItem = {
  name: string;
  component: 'input' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'password' | 'number' | 'custom';
  customComponent?: Type<any>;
  label: string;
  placeholder?: string;
  rules?: {
    [key in RulesKey]?: boolean | number | string[];
  };
  errorMessage?: ErrorMessage;
  defaultValue?: any;
  when?: (form: any) => boolean;
  /** select / radio options */
  options?: FormOption[];
  /** textarea rows */
  rows?: number;
  /** number input min/max */
  min?: number;
  max?: number;
  /** disable field */
  disabled?: boolean;
};

export type FormConfig = FormConfigItem[];

export type GroupValidator = {
  name: string;
  validator: string;
  fields: string[];
  errorKey: string;
  message: string;
};
