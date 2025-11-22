import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Pages } from './dashboard/pages';
import { Welcome } from './dashboard/welcome/welcome';
import { User } from './dashboard/system/user/user';
import { Role } from './dashboard/system/role/role';
import { Menu } from './dashboard/system/menu/menu';
import { Dict } from './dashboard/system/dict/dict';    
import { Logininfor } from './dashboard/system/log/logininfor/logininfor';
import { Operlog } from './dashboard/system/log/operlog/operlog';
import { Dept } from './dashboard/system/dept/dept';
import { Config } from './dashboard/system/config/config';
import { Notice } from './dashboard/system/notice/notice';    
import { Cache } from './dashboard/monitor/cache/cache';
import { CacheList } from './dashboard/monitor/cache-list/cache-list';
import { Job } from './dashboard/monitor/job/job';
import { Online } from './dashboard/monitor/online/online';
import { Server } from './dashboard/monitor/server/server';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', component: Login },
  {
    path: 'system',
    component: Pages,
    children: [
      { path: 'welcome', component: Welcome },
      { path: 'user', component: User },
      { path: 'role', component: Role },
      { path: 'menu', component: Menu },  
      { path: 'dict', component: Dict },  
      { path: 'logininfor', component: Logininfor },
      { path: 'operlog', component: Operlog},
      { path: 'dept', component: Dept },
      { path: 'config', component: Config },
      { path: 'notice', component: Notice },
    ],
  },
  {
    path: 'monitor',
    component: Pages,
    children: [
      { path: 'cache', component: Cache },
      { path: 'cache-list', component: CacheList },
      { path: 'job', component: Job },
      { path: 'online', component: Online },
      { path: 'server', component: Server },
    ],
  },
];
