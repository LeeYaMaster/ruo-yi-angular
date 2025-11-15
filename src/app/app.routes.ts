import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Pages } from './pages/pages';
import { Welcome } from './pages/welcome/welcome';
import { User } from './user/user';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', component: Login },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: 'welcome', component: Welcome },
      { path: 'user', component: User },
    ],
  },
  // { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) }
];
