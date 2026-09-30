import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { JobApiService } from '../../../api/monitor/job.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, NzSwitchModule, NzRadioModule, HasPermiDirective],
  templateUrl: './job.html', styleUrl: './job.less',
})
export class Job implements OnInit {
  private api = inject(JobApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private router = inject(Router);
  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  statusOptions: DictOption[] = []; groupOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, jobName: '', jobGroup: undefined as string | undefined, status: undefined as string | undefined };
  checkedIds = new Set<number>(); allChecked = false; indeterminate = false;
  modalVisible = false; modalTitle = '新增任务'; submitting = false;
  form: any = this.emptyForm(); parseTime = parseTime;
  ngOnInit() {
    this.dict.getDict('sys_job_status').subscribe(d => this.statusOptions = d);
    this.dict.getDict('sys_job_group').subscribe(d => this.groupOptions = d);
    this.getList();
  }
  emptyForm() {
    return { jobId: undefined as number | undefined, jobName: '', jobGroup: 'DEFAULT', invokeTarget: '', cronExpression: '', misfirePolicy: '1', concurrent: '1', status: '0', remark: '' };
  }
  getList() {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => { const p = parsePage(res); this.list.set(p.list); this.total.set(p.total); this.loading.set(false); this.checkedIds.clear(); this.refreshChecked(); },
      error: () => this.loading.set(false),
    });
  }
  onQuery() { this.query.pageNum = 1; this.getList(); }
  onReset() { this.query = { pageNum: 1, pageSize: 10, jobName: '', jobGroup: undefined, status: undefined }; this.getList(); }
  onPageIndexChange(p: number) { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number) { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onItemChecked(id: number, c: boolean) { c ? this.checkedIds.add(id) : this.checkedIds.delete(id); this.refreshChecked(); }
  onAllChecked(c: boolean) { this.list().forEach(r => c ? this.checkedIds.add(r.jobId) : this.checkedIds.delete(r.jobId)); this.refreshChecked(); }
  refreshChecked() { const e = this.list(); this.allChecked = e.length > 0 && e.every(r => this.checkedIds.has(r.jobId)); this.indeterminate = e.some(r => this.checkedIds.has(r.jobId)) && !this.allChecked; }
  openAdd() { this.form = this.emptyForm(); this.modalTitle = '新增任务'; this.modalVisible = true; }
  openEdit(row?: any) {
    const id = row?.jobId ?? [...this.checkedIds][0]; if (!id) return;
    this.modalTitle = '修改任务';
    this.api.get(id).subscribe({ next: (res) => { const d = res?.data ?? {}; this.form = { ...this.emptyForm(), ...d }; this.modalVisible = true; } });
  }
  submit() {
    if (!this.form.jobName || !this.form.invokeTarget || !this.form.cronExpression) { this.message.warning('请填写完整'); return; }
    this.submitting = true;
    const req$ = this.form.jobId ? this.api.update(this.form) : this.api.add(this.form);
    req$.subscribe({ next: () => { this.message.success('操作成功'); this.modalVisible = false; this.submitting = false; this.getList(); }, error: () => this.submitting = false });
  }
  remove(row?: any) {
    const ids = row?.jobId ?? [...this.checkedIds].join(','); if (!ids) return;
    this.modal.confirm({ nzTitle: '确认删除', nzContent: `是否确认删除定时任务编号为"${ids}"的数据项？`, nzOnOk: () => new Promise<void>((resolve, reject) => {
      this.api.remove(ids).subscribe({ next: () => { this.message.success('删除成功'); this.getList(); resolve(); }, error: () => reject() });
    })});
  }
  onStatusChange(row: any, checked: boolean) {
    const status = checked ? '0' : '1';
    const text = status === '0' ? '启用' : '停用';
    this.modal.confirm({
      nzTitle: '确认', nzContent: `确认要"${text}""${row.jobName}"任务吗?`,
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.changeStatus(row.jobId, status).subscribe({ next: () => { row.status = status; this.message.success(text + '成功'); resolve(); }, error: () => reject() });
      }),
    });
  }
  run(row: any) {
    this.modal.confirm({
      nzTitle: '确认', nzContent: `确认要立即执行一次"${row.jobName}"任务吗?`,
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.run(row.jobId, row.jobGroup).subscribe({ next: () => { this.message.success('执行成功'); resolve(); }, error: () => reject() });
      }),
    });
  }
  groupLabel(v: string) { return this.dict.label(this.groupOptions, v); }

  goJobLog(row?: any): void {
    const q: any = {};
    if (row?.jobName) q.jobName = row.jobName;
    if (row?.jobGroup) q.jobGroup = row.jobGroup;
    this.router.navigate(['/monitor/job-log'], { queryParams: q });
  }
}

