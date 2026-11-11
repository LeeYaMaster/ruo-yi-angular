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
import { OperlogApiService } from '../../../../api/monitor/operlog.api.service';
import { DictService, DictOption } from '../../../../api/dict.service';
import { parsePage, parseTime } from '../../../../util/ruoyi.util';
import { DownloadService } from '../../../../http/download.service';
import { HasPermiDirective } from '../../../../auth/has-permi.directive';
import { BuilderTable } from '../../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../../builder/builder-table/builder-table.model';

@Component({
  selector: 'app-operlog',
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, HasPermiDirective, BuilderTable],
  templateUrl: './operlog.html', styleUrl: './operlog.less',
})
export class Operlog implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  private api = inject(OperlogApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);
  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  typeOptions: DictOption[] = []; statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, title: '', operName: '', businessType: undefined as string | undefined, status: undefined as string | undefined };
  checkedIds = new Set<number>();
  detailVisible = false; detail: any = {};
  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'operId', title: '日志编号', width: '90px' },
    { key: 'title', title: '系统模块' },
    { key: 'businessType', title: '操作类型', format: (_r, v) => this.typeLabel(v) },
    { key: 'operName', title: '操作人员' },
    { key: 'operIp', title: '操作地址' },
    { key: 'status', title: '操作状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'operTime', title: '操作日期', format: (_r, v) => this.parseTime(v) || '' },
  ];
  ngOnInit() {
    this.dict.getDict('sys_oper_type').subscribe(d => this.typeOptions = d);
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
  onReset() { this.query = { pageNum: 1, pageSize: 10, title: '', operName: '', businessType: undefined, status: undefined }; this.getList(); }
  onPageIndexChange(p: number) { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number) { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onSelection(ids: Set<any>) { this.checkedIds = ids as Set<number>; }
  remove(row?: any) {
    const ids = row?.operId ?? [...this.checkedIds].join(','); if (!ids) return;
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除日志编号为"${ids}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.remove(ids).subscribe({ next: () => { this.message.success('删除成功'); this.getList(); resolve(); }, error: () => reject() });
    })});
  }
  clean() {
    this.modal.confirm({ nzTitle: '确认清空', nzContent: '是否确认清空所有操作日志？', nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.clean().subscribe({ next: () => { this.message.success('清空成功'); this.getList(); resolve(); }, error: () => reject() });
    })});
  }
  showDetail(row: any) { this.detail = row; this.detailVisible = true; }
  typeLabel(v: any) { return this.dict.label(this.typeOptions, v); }
  statusLabel(v: any) { return this.dict.label(this.statusOptions, v); }
  export(): void {
    this.download.download('monitor/operlog/export', { ...this.query }, `operlog_${Date.now()}.xlsx`);
  }
}
