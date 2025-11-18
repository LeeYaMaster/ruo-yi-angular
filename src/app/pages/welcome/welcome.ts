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
          validator: Validators.required, 
          error: 'Please input your name' 
        },
        { 
          validator: Validators.minLength(3), 
          error: 'Name must be at least 3 characters' 
        }
      ],
      value: ''
    },{
      name: 'age',
      type: 'input',
      label: 'Age',
      placeholder: 'Enter your age',
      when: (form: any) => form.name === '1'
    },{
      name: 'sex',
      type: 'input',
      label: 'Sex',
      placeholder: 'Enter your sex',
      when: (form: any) => form.name === '1' && form.age === '2'
    },
  ]
}
