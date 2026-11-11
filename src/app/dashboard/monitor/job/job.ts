import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { DownloadService } from '../../../http/download.service';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-job',
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, HasPermiDirective, BuilderTable, BuilderForm],
  templateUrl: './job.html', styleUrl: './job.less',
})
export class Job implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;
  private api = inject(JobApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private router = inject(Router);
  private download = inject(DownloadService);
  loading = signal(false); list = signal<any[]>([]); total = signal(0);
  statusOptions: DictOption[] = []; groupOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, jobName: '', jobGroup: undefined as string | undefined, status: undefined as string | undefined };
  checkedIds = new Set<number>();
  modalVisible = false; modalTitle = '新增任务'; submitting = false;
  formConfig: FormConfig = [];
  editingId?: number;
  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'jobId', title: '任务编号', width: '90px' },
    { key: 'jobName', title: '任务名称' },
    { key: 'jobGroup', title: '任务组名', format: (_r, v) => this.groupLabel(v) },
    { key: 'invokeTarget', title: '调用目标' },
    { key: 'cronExpression', title: 'cron' },
    { key: 'status', title: '状态', format: (r, v) => this.statusLabel(v) },
  ];
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
      next: (res) => { const p = parsePage(res); this.list.set(p.list); this.total.set(p.total); this.loading.set(false); this.checkedIds.clear(); this.bt?.clearSelection(); },
      error: () => this.loading.set(false),
    });
  }
  onQuery() { this.query.pageNum = 1; this.getList(); }
  onReset() { this.query = { pageNum: 1, pageSize: 10, jobName: '', jobGroup: undefined, status: undefined }; this.getList(); }
  onPageIndexChange(p: number) { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number) { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onSelection(ids: Set<any>) { this.checkedIds = ids as Set<number>; }
  private buildFormConfig(data: any): FormConfig {
    return [
      { name: 'jobName', component: 'input', label: '任务名称', placeholder: '请输入任务名称', rules: { required: true }, errorMessage: { required: '任务名称不能为空' }, defaultValue: data.jobName ?? '' },
      { name: 'jobGroup', component: 'select', label: '任务分组', defaultValue: data.jobGroup ?? 'DEFAULT', options: this.groupOptions.map(d => ({ label: d.label, value: d.value })) },
      { name: 'invokeTarget', component: 'input', label: '调用目标', placeholder: '请输入调用目标字符串', rules: { required: true }, errorMessage: { required: '调用目标不能为空' }, defaultValue: data.invokeTarget ?? '' },
      { name: 'cronExpression', component: 'input', label: 'cron表达式', placeholder: '请输入cron表达式', rules: { required: true }, errorMessage: { required: 'cron表达式不能为空' }, defaultValue: data.cronExpression ?? '' },
      { name: 'status', component: 'radio', label: '状态', defaultValue: data.status ?? '0', options: this.statusOptions.map(d => ({ label: d.label, value: d.value })) },
      { name: 'remark', component: 'textarea', label: '备注', placeholder: '请输入内容', defaultValue: data.remark ?? '', rows: 2 },
    ];
  }
  openAdd() { this.editingId = undefined; this.modalTitle = '新增任务'; this.formConfig = this.buildFormConfig({}); this.modalVisible = true; }
  openEdit(row?: any) {
    const id = row?.jobId ?? [...this.checkedIds][0]; if (!id) return;
    this.modalTitle = '修改任务';
    this.api.get(id).subscribe({ next: (res) => { const d = res?.data ?? {}; this.editingId = d.jobId; this.formConfig = this.buildFormConfig(d); this.modalVisible = true; } });
  }
  submit() {
    const bf = this.bf;
    if (!bf) return;
    if (bf.validateForm.invalid) { bf.submitForm(); return; }
    const value = bf.getRawValue();
    if (!value.jobName || !value.invokeTarget || !value.cronExpression) { this.message.warning('请填写完整'); return; }
    this.submitting = true;
    const payload = { ...value, jobId: this.editingId };
    const req$ = this.editingId ? this.api.update(payload) : this.api.add(payload);
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
  statusLabel(v: string) { return this.dict.label(this.statusOptions, v); }

  export(): void {
    this.download.download('monitor/job/export', { ...this.query }, `job_${Date.now()}.xlsx`);
  }

  goJobLog(row?: any): void {
    const q: any = {};
    if (row?.jobName) q.jobName = row.jobName;
    if (row?.jobGroup) q.jobGroup = row.jobGroup;
    this.router.navigate(['/monitor/job-log'], { queryParams: q });
  }
}

