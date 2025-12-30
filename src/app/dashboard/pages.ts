import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { PagesApiService } from './pages.api.service';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';
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
    CommonModule
  ],
  templateUrl: './pages.html',
  styleUrl: './pages.less',
})
export class Pages implements OnInit {
  isCollapsed = false;
  // 使用 signal 存储菜单数据，zoneless 模式下会自动检测变更
  list = signal<any[]>([]);
  exit() {}
  private pagesApiService = inject(PagesApiService);

  ngOnInit() {
    this.loadMenu();
    this.getUserInfo()
  }

  getUserInfo() {
    this.pagesApiService.getInfo().subscribe((res) => {
      console.log('用户信息:', res);
      
    });
  }
  
  loadMenu() {
    this.pagesApiService.getRouters().subscribe({
      next: (res) => {
        console.log('菜单接口返回:', res);
        if (res && res.code === 200 && res.data) {
          console.log('菜单数据:', res.data);
          this.list.set(res.data);
          console.log('菜单列表已更新，当前值:', this.list());
        } else {
          console.warn('菜单数据格式异常:', res);
        }
      },
      error: (err) => {
        console.error('获取菜单失败:', err);
      }
    });
  }
}
