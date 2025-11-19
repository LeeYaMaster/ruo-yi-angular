import { Component } from '@angular/core';
import { BuilderForm } from '../../builder/builder-form/builder-form';
import { FormConfig } from '../../builder/builder-form/builder-form.model';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  imports: [BuilderForm],
  templateUrl: './welcome.html',
  styleUrl: './welcome.less',
})
export class Welcome {
  formConfig: FormConfig = [
    // {
    //   name: 'name',
    //   component: 'input',
    //   label: 'Name',
    //   placeholder: 'Enter your name',
    //   rules: {
    //     // required: true,
    //     // minlength: 2,
    //     // maxlength: 5
    //     custom: ['phone']
    //   },
    //   errorMessage: {
    //     // required: 'Please input your name',
    //     // minlength: 'Name must be at least 2 characters',
    //     // maxlength: 'Name must be at most 5 characters',
    //     phone: 'Phone number is invalid',
    //   },
    //   defaultValue: ''
    // },{
    //   name: 'age',
    //   component: 'input',
    //   label: 'Age',
    //   placeholder: 'Enter your age',
    //   when: (form: any) => form.name === '1',
    //   rules: {
    //     required: true,
    //   },
    //   errorMessage: {
    //     required: 'Please input your age',
    //   },
    //     // { type: "range", value: [18, 30], error: "age must be between 18 and 30" },
    //     // { type: "custom", validator: "noFloat", error: "cannot input decimal" }
    // },{
    //   name: 'sex',
    //   component: 'input',
    //   label: 'Sex',
    //   placeholder: 'Enter your sex',
    //   when: (form: any) => form.name === '1' && form.age === '2'
    // },
    // todo   // 可选：触发时机、异步校验、条件校验
    // pattern
    // validateTrigger: 'blur',
    // asyncValidator: 'remoteUnique',   // 运行时注入
    {
      name: 'password',
      component: 'input',
      label: 'Password',
      placeholder: 'Enter your password',
      rules: {
        required: true,
      },
    },
    {
      name: 'confirmPassword',
      component: 'input',
      label: 'Confirm Password',
      placeholder: 'Enter your confirm password',
      rules: {
        required: true,
      },
    },
  ];
  // ****** 整组交叉校验 ****** 
  groupValidators = [
    {
      name: 'confirmMismatch',          // 规则名
      validator: 'confirmPassword',     // 运行时注入的函数名
      fields: ['password', 'confirmPassword'], // 依赖字段
      message: 'The two passwords do not match' // 整组报错文案
    }
  ]
}
