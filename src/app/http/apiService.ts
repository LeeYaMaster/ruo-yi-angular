import { Injectable } from '@angular/core';
import { baseHttp } from './http';

/**
 * 用户登录服务
 */

@Injectable()
export class ApiService {
  constructor(private http: baseHttp) {}
  // // 上传
  // uploadImg(data, callbackFun) {
  //   this.http.upload('admin/upload/file',
  //     data
  //     , callbackFun);
  // }
  //
  // // 分类图片上传
  // uploadClassifyImg(data, callbackFun) {
  //   this.http.upload('admin/classify/setimg',
  //     data
  //     , callbackFun);
  // }
  // RBAC权限管理
  // 登录
  // async login(data) {
  //   return await this.http.post('admin/login', data);
  // }
  // async loginOut(data) {
  //   return await this.http.get('admin/loginOut', data);
  // }
  // // 获取用户权限
  // async getRoleId(data) {
  //   return await this.http.get('admin/getRoleId', data);
  // }
  // // 获取所有权限
  // async getAllRole(data) {
  //   return await this.http.get('admin/getAllRole', data);
  // }
  // // 管理员模块
  // async getManager(data) {
  //   return await this.http.get('admin/manager', data);
  // }
  // async addManager(data) {
  //   return await this.http.post('admin/manager', data);
  // }
  // async editManager(data) {
  //   return await this.http.put('admin/manager', data);
  // }
  // async deleteManager(data) {
  //   return await this.http.delete('admin/manager', data);
  // }
  // // 获取所有权限
  // async getAccess(data) {
  //   return await this.http.get('admin/access', data);
  // }
  // async getAccessModule(data) {
  //   return await this.http.get('admin/access/module', data);
  // }
  // async addAccess(data) {
  //   return await this.http.post('admin/access', data);
  // }
  // async editAccess(data) {
  //   return await this.http.put('admin/access', data);
  // }
  // async deleteAccess(data) {
  //   return await this.http.delete('admin/access', data);
  // }
  // async getRole(data) {
  //   return await this.http.get('admin/role', data);
  // }
  // async addRole(data) {
  //   return await this.http.post('admin/role', data);
  // }
  // async editRole(data) {
  //   return await this.http.put('admin/role', data);
  // }
  // async deleteRole(data) {
  //   return await this.http.delete('admin/role', data);
  // }
  // // 授权
  // async auth(data) {
  //   return await this.http.post('admin/role/auth', data);
  // }
}
