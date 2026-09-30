import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { JobLogApiService } from '../../../api/monitor/job-log.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { DownloadService } from '../../../http/download.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';

@Component({
  selector: 'app-job-log',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, HasPermiDirective],
  templateUrl: './job-log.html',
  styleUrl: './job-log.less',
})
export class JobLog implements OnInit {
  private api = inject(JobLogApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  statusOptions: DictOption[] = [];
  groupOptions: DictOption[] = [];
  query = {
    pageNum: 1,
    pageSize: 10,
    jobName: '',
    jobGroup: undefined as string | undefined,
    status: undefined as string | undefined,
  };
  detailVisible = false;
  detail: any = {};
  parseTime = parseTime;

  ngOnInit(): void {
    const jobName = this.route.snapshot.queryParamMap.get('jobName');
    const jobGroup = this.route.snapshot.queryParamMap.get('jobGroup');
    if (jobName) this.query.jobName = jobName;
    if (jobGroup) this.query.jobGroup = jobGroup;
    this.dict.getDict('sys_common_status').subscribe((d) => (this.statusOptions = d));
    this.dict.getDict('sys_job_group').subscribe((d) => (this.groupOptions = d));
    this.getList();
  }

  getList(): void {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => {
        const p = parsePage(res);
        this.list.set(p.list);
        this.total.set(p.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void { this.query.pageNum = 1; this.getList(); }
  onReset(): void {
    this.query = { pageNum: 1, pageSize: 10, jobName: '', jobGroup: undefined, status: undefined };
    this.getList();
  }
  onPageIndexChange(p: number): void { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number): void { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }

  clean(): void {
    this.modal.confirm({
      nzTitle: '确认清空',
      nzContent: '是否确认清空所有调度日志？',
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.clean().subscribe({
          next: () => { this.message.success('清空成功'); this.getList(); resolve(); },
          error: () => reject(),
        });
      }),
    });
  }

  export(): void {
    this.download.download('monitor/jobLog/export', { ...this.query }, `job_log_${Date.now()}.xlsx`);
  }

  showDetail(row: any): void {
    this.detail = row;
    this.detailVisible = true;
  }

  close(): void {
    this.router.navigate(['/monitor/job']);
  }

  statusLabel(v: any): string { return this.dict.label(this.statusOptions, v); }
  groupLabel(v: any): string { return this.dict.label(this.groupOptions, v); }
}
