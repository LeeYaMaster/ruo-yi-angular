import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Page } from './page/page';
import { User } from './user/user';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'dashboard',
        component: Page,
        children: [
            {
                path: 'user',
                component: User
            }
        ]
    }
];
