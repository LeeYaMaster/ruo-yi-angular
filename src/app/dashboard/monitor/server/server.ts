import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ServerApiService } from '../../../api/monitor/server.api.service';

@Component({
  selector: 'app-server',
  imports: [CommonModule, NzCardModule, NzSpinModule, NzButtonModule, NzIconModule],
  templateUrl: './server.html', styleUrl: './server.less',
})
export class Server implements OnInit {
  private api = inject(ServerApiService);
  loading = signal(false);
  data = signal<any>({});
  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.api.getServer().subscribe({
      next: (res) => { this.data.set(res?.data ?? {}); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
