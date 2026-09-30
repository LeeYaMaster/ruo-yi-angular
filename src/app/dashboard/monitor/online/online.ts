import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { OnlineApiService } from '../../../api/monitor/online.api.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';

@Component({
  selector: 'app-online',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzFormModule, NzModalModule, NzIconModule, HasPermiDirective],
  templateUrl: './online.html', styleUrl: './online.less',
})
export class Online implements OnInit {
  private api = inject(OnlineApiService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  query = { ipaddr: '', userName: '' };
  parseTime = parseTime;
  ngOnInit() { this.getList(); }
  getList() {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => { const p = parsePage(res); this.list.set(p.list); this.total.set(p.total); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  onQuery() { this.getList(); }
  onReset() { this.query = { ipaddr: '', userName: '' }; this.getList(); }
  forceLogout(row: any) {
    this.modal.confirm({
      nzTitle: '确认强退',
      nzContent: `是否确认强退名称为"${row.userName}"的用户？`,
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.forceLogout(row.tokenId).subscribe({ next: () => { this.message.success('强退成功'); this.getList(); resolve(); }, error: () => reject() });
      }),
    });
  }
}
