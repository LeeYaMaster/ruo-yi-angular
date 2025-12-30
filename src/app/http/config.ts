import { Injectable } from '@angular/core';

@Injectable()
export class Config {
  // 开发环境 API 地址（通过代理转发到后端）
  public static API_URL = '/dev-api/';
  
  // 生产环境配置（根据实际部署情况修改）
  // public static API_URL = '/api/';
  // public static API_URL = 'http://your-backend-domain.com/api/';
  
  // 请求超时时间（毫秒）
  public static TIMEOUT = 10000;

  constructor() {}
}
