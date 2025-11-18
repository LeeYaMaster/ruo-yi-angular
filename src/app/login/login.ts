import { Component, inject } from '@angular/core';

import { LoginApiService } from './login.api.service';
import { BuilderForm } from '../builder/builder-form/builder-form';
@Component({
  selector: 'app-login',
  imports: [BuilderForm],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
    private loginApiService = inject(LoginApiService);



}
