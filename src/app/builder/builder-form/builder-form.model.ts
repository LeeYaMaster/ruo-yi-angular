import { ValidatorFn } from "@angular/forms";


export type RulesKey = 'required' | 'minlength' | 'maxlength' | 
    'pattern' | 'email' | 'url' | 'tel' | 'number' | 'date' | 
    'time' | 'datetime-local' | 'month' | 'week' | 'color' | 
    'checkbox' | 'radio' | 'select' | 'textarea' | 'file' | 
    'image' | 'video' | 'audio' | 'map' | 'geo' | 'search' | 
    'tel' | 'url' | 'email' | 'password' | 'confirm' | 'custom';

export type FormConfigItem = {
    name: string;
    type: 'input' | 'select' | 'radio' | 'checkbox' | 'textarea';
    label: string;
    placeholder: string;
    rules?: {
      validator: ValidatorFn;
      key: RulesKey;
      error: string;
    }[];
    value?: any;
    when?: (form: any) => boolean;
  };
  
export type FormConfig = FormConfigItem[];