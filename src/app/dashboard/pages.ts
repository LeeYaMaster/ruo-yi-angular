import { Component, inject } from '@angular/core';
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
export class Pages {
  isCollapsed = false;
  list: any = []
  exit() {}
  private pagesApiService = inject(PagesApiService);

  ngOnInit() {
    this.loadMenu();
    this.getUserInfo()
  }

  getUserInfo() {
    this.pagesApiService.getInfo().subscribe((res) => {
      console.log(res);
      
    });
  }
  
  loadMenu() {
    this.pagesApiService.getRouters().subscribe((res) => {
      console.log(res);
      this.list = res.data;
    });
  }
}
