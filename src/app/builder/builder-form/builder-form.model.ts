export type FormConfigItem = {
    name: string;
    type: 'input' | 'select' | 'radio' | 'checkbox' | 'textarea';
    label: string;
    placeholder: string;
    rules?: {
      validator: any;
      error: string;
    }[];
    value?: any;
    when?: (form: any) => boolean;
  };
  
export type FormConfig = FormConfigItem[];