import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CacheApiService } from '../../../api/monitor/cache.api.service';

@Component({
  selector: 'app-cache',
  imports: [CommonModule, NzCardModule, NzSpinModule, NzButtonModule, NzIconModule],
  templateUrl: './cache.html', styleUrl: './cache.less',
})
export class Cache implements OnInit {
  private api = inject(CacheApiService);
  loading = signal(false);
  data = signal<any>({});
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.getCache().subscribe({
      next: (res) => { this.data.set(res?.data ?? {}); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
