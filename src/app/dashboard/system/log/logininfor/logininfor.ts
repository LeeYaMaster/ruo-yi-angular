import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LogininforApiService } from '../../../../api/monitor/logininfor.api.service';
import { DictService, DictOption } from '../../../../api/dict.service';
import { parsePage, parseTime } from '../../../../util/ruoyi.util';
import { DownloadService } from '../../../../http/download.service';
import { HasPermiDirective } from '../../../../auth/has-permi.directive';
import { BuilderTable } from '../../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../../builder/builder-table/builder-table.model';

@Component({
  selector: 'app-logininfor',
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, HasPermiDirective, BuilderTable],
  templateUrl: './logininfor.html', styleUrl: './logininfor.less',
})
export class Logininfor implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  private api = inject(LogininforApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);
  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, ipaddr: '', userName: '', status: undefined as string | undefined };
  checkedIds = new Set<number>();
  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'infoId', title: '访问编号', width: '90px' },
    { key: 'userName', title: '用户名称' },
    { key: 'ipaddr', title: '地址' },
    { key: 'loginLocation', title: '登录地点' },
    { key: 'browser', title: '浏览器' },
    { key: 'os', title: '操作系统' },
    { key: 'status', title: '登录状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'msg', title: '描述' },
    { key: 'loginTime', title: '访问时间', format: (_r, v) => this.parseTime(v) || '' },
  ];
  ngOnInit() {
    this.dict.getDict('sys_common_status').subscribe(d => this.statusOptions = d);
    this.getList();
  }
  getList() {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => { const p = parsePage(res); this.list.set(p.list); this.total.set(p.total); this.loading.set(false); this.checkedIds.clear(); this.bt?.clearSelection(); },
      error: () => this.loading.set(false),
    });
  }
  onQuery() { this.query.pageNum = 1; this.getList(); }
  onReset() { this.query = { pageNum: 1, pageSize: 10, ipaddr: '', userName: '', status: undefined }; this.getList(); }
  onPageIndexChange(p: number) { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number) { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onSelection(ids: Set<any>) { this.checkedIds = ids as Set<number>; }
  remove(row?: any) {
    const ids = row?.infoId ?? [...this.checkedIds].join(','); if (!ids) return;
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除访问编号为"${ids}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.remove(ids).subscribe({ next: () => { this.message.success('删除成功'); this.getList(); resolve(); }, error: () => reject() });
    })});
  }
  clean() {
    this.modal.confirm({ nzTitle: '确认清空', nzContent: '是否确认清空所有登录日志？', nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.clean().subscribe({ next: () => { this.message.success('清空成功'); this.getList(); resolve(); }, error: () => reject() });
    })});
  }
  unlock(row: any) {
    this.api.unlock(row.userName).subscribe({ next: () => this.message.success('用户' + row.userName + '解锁成功') });
  }
  statusLabel(v: any) { return this.dict.label(this.statusOptions, v); }
  export(): void {
    this.download.download('monitor/logininfor/export', { ...this.query }, `logininfor_${Date.now()}.xlsx`);
  }
  unlockSelected(): void {
    const id = [...this.checkedIds][0];
    const row = this.list().find((r) => r.infoId === id);
    if (row) this.unlock(row);
  }
}
