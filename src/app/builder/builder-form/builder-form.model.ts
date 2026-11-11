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
  component:
    | 'input'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'checkbox-group'
    | 'textarea'
    | 'password'
    | 'number'
    | 'editor'
    | 'tree-select'
    | 'tree-check'
    | 'custom';
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
  /** select mode */
  mode?: 'default' | 'multiple';
  /** nz-tree-select / tree-check nodes */
  treeData?: any[];
  /**
   * tree-check: 父子联动，对应若依 menuCheckStrictly / deptCheckStrictly。
   * true = 联动（nzCheckStrictly=false）；false = 父子独立。
   */
  treeLinkage?: boolean;
  /** tree-check: 提交时额外写出联动布尔值的字段名，如 menuCheckStrictly */
  treeLinkageName?: string;
  /** tree-check: 初始是否全部展开 */
  treeExpandAll?: boolean;
  /** tree-check: 是否显示 展开/全选/父子联动 工具条，默认 true */
  treeToolbar?: boolean;
};

export type FormConfig = FormConfigItem[];

export type GroupValidator = {
  name: string;
  validator: string;
  fields: string[];
  errorKey: string;
  message: string;
};
