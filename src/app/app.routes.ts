import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Pages } from './dashboard/pages';
import { Welcome } from './dashboard/welcome/welcome';
import { User } from './dashboard/system/user/user';
import { AuthRole } from './dashboard/system/user/auth-role/auth-role';
import { Profile } from './dashboard/system/user/profile/profile';
import { Role } from './dashboard/system/role/role';
import { AuthUser } from './dashboard/system/role/auth-user/auth-user';
import { Menu } from './dashboard/system/menu/menu';
import { Dict } from './dashboard/system/dict/dict';
import { Logininfor } from './dashboard/system/log/logininfor/logininfor';
import { Operlog } from './dashboard/system/log/operlog/operlog';
import { Dept } from './dashboard/system/dept/dept';
import { Config } from './dashboard/system/config/config';
import { Notice } from './dashboard/system/notice/notice';
import { Post } from './dashboard/system/post/post';

import { Cache } from './dashboard/monitor/cache/cache';
import { CacheList } from './dashboard/monitor/cache-list/cache-list';
import { Job } from './dashboard/monitor/job/job';
import { JobLog } from './dashboard/monitor/job-log/job-log';
import { Online } from './dashboard/monitor/online/online';
import { Server } from './dashboard/monitor/server/server';

import { Gen } from './dashboard/tool/gen/gen';
import { GenEdit } from './dashboard/tool/gen/gen-edit/gen-edit';
import { Swagger } from './dashboard/tool/swagger/swagger';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'system',
    component: Pages,
    children: [
      { path: 'welcome', component: Welcome },
      { path: 'user', component: User },
      { path: 'user-auth/role/:userId', component: AuthRole },
      { path: 'user/profile', component: Profile },
      { path: 'profile', component: Profile },
      { path: 'role', component: Role },
      { path: 'role-auth/user/:roleId', component: AuthUser },
      { path: 'menu', component: Menu },
      { path: 'dict', component: Dict },
      { path: 'logininfor', component: Logininfor },
      { path: 'operlog', component: Operlog },
      { path: 'dept', component: Dept },
      { path: 'config', component: Config },
      { path: 'notice', component: Notice },
      { path: 'post', component: Post },
    ],
  },
  {
    path: 'monitor',
    component: Pages,
    children: [
      { path: 'cache', component: Cache },
      { path: 'cacheList', component: CacheList },
      { path: 'cache-list', component: CacheList },
      { path: 'job', component: Job },
      { path: 'job-log', component: JobLog },
      { path: 'job/log', component: JobLog },
      { path: 'online', component: Online },
      { path: 'server', component: Server },
      { path: 'operlog', component: Operlog },
      { path: 'logininfor', component: Logininfor },
    ],
  },
  {
    path: 'tool',
    component: Pages,
    children: [
      { path: 'gen', component: Gen },
      { path: 'gen-edit/:tableId', component: GenEdit },
      { path: 'swagger', component: Swagger },
    ],
  },
];
