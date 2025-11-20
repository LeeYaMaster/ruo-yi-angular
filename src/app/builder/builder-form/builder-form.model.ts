import { ValidatorFn } from "@angular/forms";

// rules
// | 变量名          | 类型                 | 说明                                      | 映射示例（Angular）                                         |
// | ------------ | ------------------ | --------------------------------------- | ----------------------------------------------------- |
// | `type`       | `string`           | 规则类型（required/min/max/regexp/email/...） | `Validators.required`                                 |
// | `value?`     | `number \| string` | 边界值（min/max/length/pattern 时用）          | `Validators.min(value)`                               |
// | `message`    | `string`           | 错误提示语                                   | `*{ type: 'min', message: '不得小于{value}' }`            |
// | `trigger?`   | `string`           | 触发时机（blur/change/submit）                | 决定何时标记 dirty                                          |
// | `len?`       | `number`           | 精确长度（minLength/maxLength 的快捷写法）         | `Validators.minLength(len)`                           |
// | `pattern?`   | `string`           | 正则字符串（去掉两边 `/`）                         | `new RegExp(pattern)`                                 |
// | `range?`     | `[number, number]` | 数值范围 `[min, max]`                       | `Validators.min(range[0]) + Validators.max(range[1])` |
// | `whitelist?` | `string[]`         | 白名单枚举                                   | `Validators.pattern('^(white1\|white2)$')`            |
// | `blacklist?` | `string[]`         | 黑名单枚举                                   | 自定义 validator                                         |
// | `validator?` | `string`           | 扩展：运行时注入的**函数名**（保持 JSON 可序列化）          | `this.customValidators[validator]`                    |

// 内置验证器返回的 key 集合（官方文档枚举）
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

// export type ErrorMessage = Record<RulesKey, string>;
export type ErrorMessage = {
  // [key in RulesKey]?: string;
  [key: string]: string;
};

export type FormConfigItem = {
    name: string;
    component: 'input' | 'select' | 'radio' | 'checkbox' | 'textarea';
    label: string;
    placeholder: string;
    rules?: {
      [key in RulesKey]?: boolean | number | string[];
    };
    errorMessage?: ErrorMessage;
    defaultValue?: any;
    when?: (form: any) => boolean;
  };
  
export type FormConfig = FormConfigItem[];

export type GroupValidator = {
  name: string;
  validator: string;
  fields: string[];
  errorKey: string;
  message: string;
};