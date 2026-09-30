# 若依 Angular 管理端（ruo-yi-angular）

基于 **Angular 20 + ng-zorro-antd** 的若依后台前端，对接本机 Nest 版 RuoYi 后端（默认 `http://localhost:8080`）。

Vue3 参考工程：`../ruoyi-project/admin-vue3`  
Nest 后端：`../ruoyi-project/server`

## 环境要求

- Node.js **>= 20.19**（Angular 20 CLI 要求；可用 `nvm install 20.19`）
- 本机已启动 Nest 后端，监听 **8080**

## 安装与启动

```bash
cd ~/Desktop/ruo-yi-angular
npm install
npm start
# 等价于：ng serve --proxy-config proxy.conf.json
```

浏览器打开：<http://localhost:4200/>

开发代理：`/dev-api/*` → `http://localhost:8080/*`（见 `proxy.conf.json`）。

## 构建

```bash
npm run build
```

产物在 `dist/ruoyi-admin/`。

## 已实现功能（相对 Vue admin）

- 登录 / 验证码 / Token 存储 / 退出
- 动态侧边栏（`getRouters`）
- 系统管理：用户、角色、菜单、部门、岗位、字典、参数、通知公告
- 日志：操作日志、登录日志（路由同时挂在 `/system/*` 与 `/monitor/*` 以兼容后端菜单）
- 监控：在线用户、服务监控、缓存监控、缓存列表、定时任务 + 调度日志
- 用户分配角色、角色数据权限 / 分配用户、个人中心（资料/密码/头像）
- 按钮权限：`*hasPermi="['system:user:add']"`（对齐 Vue `v-hasPermi`）
- 用户导出（Nest 无用户导入接口，导入暂未做）

## 说明

- `builder-form` / `builder-table` 仍为脚手架示例，业务页使用 ng-zorro 直写 CRUD。
- 列表分页字段兼容 Nest 的 `data.list` / `data.total`。
- 不要把密钥提交进仓库；本仓库仅本地开发使用。
