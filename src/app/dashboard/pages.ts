import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { CommonModule } from '@angular/common';
import { PagesApiService } from './pages.api.service';
import { StorageService } from '../util/storage.service';
import { TokenKey } from '../util/auth.util';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../auth/auth.service';

export interface SideMenuItem {
  path: string;
  fullPath: string;
  title: string;
  icon?: string | null;
  hidden?: boolean;
  children?: SideMenuItem[];
}

@Component({
  selector: 'app-pages',
  imports: [
    RouterLink,
    RouterOutlet,
    NzLayoutModule,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    NzAvatarModule,
    CommonModule,
  ],
  templateUrl: './pages.html',
  styleUrl: './pages.less',
})
export class Pages implements OnInit {
  isCollapsed = false;
  list = signal<SideMenuItem[]>([]);
  username = signal('用户');
  private pagesApiService = inject(PagesApiService);
  private storage = inject(StorageService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  /** 后端 icon 多为 Element 名，映射到部分 ant icon；未知则用 appstore */
  private iconMap: Record<string, string> = {
    system: 'setting',
    user: 'user',
    peoples: 'team',
    'tree-table': 'apartment',
    tree: 'apartment',
    post: 'idcard',
    dict: 'book',
    edit: 'form',
    message: 'notification',
    log: 'file-text',
    monitor: 'dashboard',
    online: 'cloud-server',
    job: 'schedule',
    druid: 'database',
    server: 'cloud-server',
    redis: 'database',
    'redis-list': 'database',
    tool: 'tool',
    build: 'build',
    code: 'code',
    swagger: 'api',
    form: 'form',
    nested: 'cluster',
    documentation: 'file-text',
    guide: 'compass',
  };

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadMenu();
    this.getUserInfo();
  }

  getUserInfo() {
    this.pagesApiService.getInfo().subscribe({
      next: (res) => {
        this.authService.setFromGetInfo(res);
        const name = res?.user?.nickName || res?.user?.userName || '用户';
        this.username.set(name);
      },
    });
  }

  goProfile() {
    this.router.navigate(['/system/user/profile']);
  }

  loadMenu() {
    this.pagesApiService.getRouters().subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.data) {
          this.list.set(this.normalizeMenus(res.data));
        }
      },
      error: (err) => console.error('获取菜单失败:', err),
    });
  }

  normalizeMenus(routes: any[], parentPath = ''): SideMenuItem[] {
    const result: SideMenuItem[] = [];
    for (const r of routes || []) {
      if (r.hidden) continue;
      const fullPath = this.joinPath(parentPath, r.path);
      const children = r.children?.length ? this.normalizeMenus(r.children, fullPath) : undefined;
      // 目录无页面：仅保留有子菜单或自身可跳转的项
      const item: SideMenuItem = {
        path: r.path,
        fullPath,
        title: r.meta?.title || r.name || r.path,
        icon: this.mapIcon(r.meta?.icon),
        hidden: r.hidden,
        children: children?.length ? children : undefined,
      };
      result.push(item);
    }
    return result;
  }

  joinPath(parent: string, child: string): string {
    if (!child) return parent || '/';
    if (/^https?:\/\//i.test(child)) return child;
    if (child.startsWith('/')) return child;
    const p = (parent || '').replace(/\/$/, '');
    if (!p || p === '/') return '/' + child.replace(/^\//, '');
    return p + '/' + child.replace(/^\//, '');
  }

  mapIcon(icon?: string): string | null {
    if (!icon || icon === '#') return null;
    return this.iconMap[icon] || 'appstore';
  }

  exit() {
    this.pagesApiService.logout().subscribe({
      next: () => this.afterLogout(),
      error: () => this.afterLogout(),
    });
  }

  private afterLogout() {
    this.storage.remove(TokenKey);
    this.authService.clear();
    this.message.success('已退出登录');
    this.router.navigate(['/login']);
  }
}
