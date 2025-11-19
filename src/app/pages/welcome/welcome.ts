import { Component } from '@angular/core';
import { BuilderForm } from '../../builder/builder-form/builder-form';
import { FormConfig } from '../../builder/builder-form/builder-form.model';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  imports: [BuilderForm],
  templateUrl: './welcome.html',
  styleUrl: './welcome.less'
})
export class Welcome {
  formConfig: FormConfig = [
    {
      name: 'name',
      type: 'input',
      label: 'Name',
      placeholder: 'Enter your name',
      rules: [
        { 
          type: 'required',
          error: 'Please input your name' 
        },
        // { 
        //   type: 'minLength',
        //   error: 'Name must be at least 3 characters',
        //   len: 3
        // },
      ],
      value: ''
    },{
      name: 'age',
      type: 'input',
      label: 'Age',
      placeholder: 'Enter your age',
      when: (form: any) => form.name === '1',
      rules: [
        { type: "required", error: "Please input your age" },
        // { type: "range", value: [18, 30], error: "age must be between 18 and 30" },
        // { type: "custom", validator: "noFloat", error: "cannot input decimal" }
      ]
    },{
      name: 'sex',
      type: 'input',
      label: 'Sex',
      placeholder: 'Enter your sex',
      when: (form: any) => form.name === '1' && form.age === '2'
    },
  ]
}
