import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RoleApiService } from '../../../../api/system/role.api.service';
import { DictService, DictOption } from '../../../../api/dict.service';
import { HasPermiDirective } from '../../../../auth/has-permi.directive';
import { parsePage, parseTime } from '../../../../util/ruoyi.util';

@Component({
  selector: 'app-auth-user',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzFormModule, NzModalModule, NzIconModule, HasPermiDirective],
  templateUrl: './auth-user.html',
  styleUrl: './auth-user.less',
})
export class AuthUser implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(RoleApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  roleId = '';
  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, roleId: '' as string | number, userName: '', phonenumber: '' };
  checkedIds = new Set<number>();
  allChecked = false;
  indeterminate = false;
  parseTime = parseTime;

  // select user modal
  selectVisible = false;
  selectLoading = false;
  selectList: any[] = [];
  selectTotal = 0;
  selectQuery = { pageNum: 1, pageSize: 10, roleId: '' as string | number, userName: '', phonenumber: '' };
  selectChecked = new Set<number>();

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('roleId') || '';
    this.query.roleId = this.roleId;
    this.dict.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.getList();
  }

  getList(): void {
    this.loading.set(true);
    this.api.allocatedUserList(this.query).subscribe({
      next: (res) => {
        const p = parsePage(res);
        this.list.set(p.list);
        this.total.set(p.total);
        this.loading.set(false);
        this.checkedIds.clear();
        this.refreshChecked();
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void { this.query.pageNum = 1; this.getList(); }
  onReset(): void {
    this.query = { pageNum: 1, pageSize: 10, roleId: this.roleId, userName: '', phonenumber: '' };
    this.getList();
  }
  onPageIndexChange(p: number): void { this.query.pageNum = p; this.getList(); }
  onPageSizeChange(s: number): void { this.query.pageSize = s; this.query.pageNum = 1; this.getList(); }
  onItemChecked(id: number, c: boolean): void { c ? this.checkedIds.add(id) : this.checkedIds.delete(id); this.refreshChecked(); }
  onAllChecked(c: boolean): void { this.list().forEach((r) => (c ? this.checkedIds.add(r.userId) : this.checkedIds.delete(r.userId))); this.refreshChecked(); }
  refreshChecked(): void {
    const e = this.list();
    this.allChecked = e.length > 0 && e.every((r) => this.checkedIds.has(r.userId));
    this.indeterminate = e.some((r) => this.checkedIds.has(r.userId)) && !this.allChecked;
  }

  statusLabel(v: string): string { return this.dict.label(this.statusOptions, v); }

  cancelOne(row: any): void {
    this.modal.confirm({
      nzTitle: '确认',
      nzContent: `确认要取消该用户"${row.userName}"角色吗？`,
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.authUserCancel({ userId: row.userId, roleId: +this.roleId }).subscribe({
          next: () => { this.message.success('取消授权成功'); this.getList(); resolve(); },
          error: () => reject(),
        });
      }),
    });
  }

  cancelAll(): void {
    const userIds = [...this.checkedIds].join(',');
    if (!userIds) return;
    this.modal.confirm({
      nzTitle: '确认',
      nzContent: '是否取消选中用户授权数据项?',
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.authUserCancelAll({ roleId: +this.roleId, userIds }).subscribe({
          next: () => { this.message.success('取消授权成功'); this.getList(); resolve(); },
          error: () => reject(),
        });
      }),
    });
  }

  openSelect(): void {
    this.selectQuery = { pageNum: 1, pageSize: 10, roleId: this.roleId, userName: '', phonenumber: '' };
    this.selectChecked.clear();
    this.selectVisible = true;
    this.loadSelect();
  }

  loadSelect(): void {
    this.selectLoading = true;
    this.api.unallocatedUserList(this.selectQuery).subscribe({
      next: (res) => {
        const p = parsePage(res);
        this.selectList = p.list;
        this.selectTotal = p.total;
        this.selectLoading = false;
      },
      error: () => (this.selectLoading = false),
    });
  }

  submitSelect(): void {
    const userIds = [...this.selectChecked].join(',');
    if (!userIds) {
      this.message.error('请选择要分配的用户');
      return;
    }
    this.api.authUserSelectAll({ roleId: +this.roleId, userIds }).subscribe({
      next: (res) => {
        this.message.success(res?.msg || '授权成功');
        this.selectVisible = false;
        this.getList();
      },
    });
  }

  close(): void {
    this.router.navigate(['/system/role']);
  }
}
