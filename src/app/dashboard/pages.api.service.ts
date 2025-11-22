import { inject, Injectable } from '@angular/core';
import { BaseHttp } from '../http/http';
import { Observable } from 'rxjs';


// getUserInfo
export interface Dept {
  delFlag: string;
  status: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string | null;
  remark: string | null;
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader: string;
  phone: string;
  email: string;
}

export interface Role {
  delFlag: string;
  status: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string | null;
  remark: string;
  roleId: number;
  roleName: string;
  roleSort: number;
  roleKey: string;
  dataScope: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
}

export interface Post {
  delFlag: string;
  status: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string | null;
  remark: string;
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
}

export interface User {
  delFlag: string;
  status: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string | null;
  remark: string;
  userId: number;
  deptId: number;
  userName: string;
  nickName: string;
  userType: string;
  email: string;
  phonenumber: string;
  sex: string;
  avatar: string;
  password: string;
  loginIp: string;
  loginDate: string;
  dept: Dept;
  roles: Role[];
  posts: Post[];
  deptName: string;
}

export interface PagesApiResponse {
  msg: string;
  code: number;
  permissions: string[];
  roles: string[];
  user: User;
}


// get router
export interface RouteMeta {
  title: string;
  icon: string;
  noCache: boolean;
}

export interface RouteChild {
  hidden: boolean;
  name: string;
  path: string;
  component: string;
  query: string;
  meta: RouteMeta;
  alwaysShow?: boolean;
  redirect?: string;
  children?: RouteChild[];
}

export interface PagesRouterApiResponse {
  code: number;
  msg: string;
  data: RouteChild[];
}



@Injectable({
  providedIn: 'root',
})
export class PagesApiService {
  baseHttp = inject(BaseHttp);
  getInfo(): Observable<PagesApiResponse> {
    return this.baseHttp.get('getInfo', {}) as Observable<PagesApiResponse>;
  }

  getRouters(): Observable<PagesRouterApiResponse> {
    return this.baseHttp.get('getRouters', {}) as Observable<PagesRouterApiResponse>;
  }
}
