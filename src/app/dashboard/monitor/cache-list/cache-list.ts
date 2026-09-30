import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CacheApiService } from '../../../api/monitor/cache.api.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';

@Component({
  selector: 'app-cache-list',
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, HasPermiDirective],
  templateUrl: './cache-list.html', styleUrl: './cache-list.less',
})
export class CacheList implements OnInit {
  private api = inject(CacheApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  names = signal<any[]>([]);
  keys = signal<any[]>([]);
  value = signal<any>(null);
  selectedName = '';
  selectedKey = '';
  loadingNames = signal(false);
  loadingKeys = signal(false);

  ngOnInit() { this.loadNames(); }
  loadNames() {
    this.loadingNames.set(true);
    this.api.listCacheName().subscribe({
      next: (res) => { this.names.set(res?.data ?? []); this.loadingNames.set(false); },
      error: () => this.loadingNames.set(false),
    });
  }
  selectName(row: any) {
    this.selectedName = row.cacheName ?? row;
    this.selectedKey = '';
    this.value.set(null);
    this.loadingKeys.set(true);
    this.api.listCacheKey(this.selectedName).subscribe({
      next: (res) => { this.keys.set(res?.data ?? []); this.loadingKeys.set(false); },
      error: () => this.loadingKeys.set(false),
    });
  }
  selectKey(key: any) {
    this.selectedKey = typeof key === 'string' ? key : (key.cacheKey ?? key);
    this.api.getCacheValue(this.selectedName, this.selectedKey).subscribe({
      next: (res) => this.value.set(res?.data ?? res),
    });
  }
  clearName(row: any) {
    const name = row.cacheName ?? row;
    this.modal.confirm({
      nzTitle: '确认清理',
      nzContent: `是否确认清理缓存名称"${name}"？`,
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.clearCacheName(name).subscribe({ next: () => { this.message.success('清理成功'); this.loadNames(); this.keys.set([]); resolve(); }, error: () => reject() });
      }),
    });
  }
  clearAll() {
    this.modal.confirm({
      nzTitle: '确认清理',
      nzContent: '是否确认清理全部缓存？',
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.clearCacheAll().subscribe({ next: () => { this.message.success('清理成功'); this.loadNames(); this.keys.set([]); this.value.set(null); resolve(); }, error: () => reject() });
      }),
    });
  }
}
