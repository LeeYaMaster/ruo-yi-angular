import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { UserApiService } from '../../../api/system/user.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { DownloadService } from '../../../http/download.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzModalModule,
    NzTreeModule,
    NzSwitchModule,
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
    NzRadioModule,
    NzSpaceModule,
    NzCardModule,
    NzTreeSelectModule,
    NzToolTipModule,
    HasPermiDirective,
  ],
  templateUrl: './user.html',
  styleUrl: './user.less',
})
export class User implements OnInit {
  private userApi = inject(UserApiService);
  private dictService = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);
  private router = inject(Router);

  loading = signal(false);
  userList = signal<any[]>([]);
  total = signal(0);
  deptNodes = signal<any[]>([]);
  deptTreeData = signal<any[]>([]);
  selectedDeptId: number | undefined;
  deptFilter = '';

  statusOptions: DictOption[] = [];
  sexOptions: DictOption[] = [];
  postOptions: any[] = [];
  roleOptions: any[] = [];

  query = {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: undefined as string | undefined,
    deptId: undefined as number | undefined,
  };

  checkedIds = new Set<number>();
  indeterminate = false;
  allChecked = false;

  modalVisible = false;
  modalTitle = '新增用户';
  submitting = false;
  form: any = this.emptyForm();

  parseTime = parseTime;

  ngOnInit(): void {
    this.dictService.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.dictService.getDict('sys_user_sex').subscribe((d) => (this.sexOptions = d));
    this.loadDeptTree();
    this.getList();
  }

  emptyForm() {
    return {
      userId: undefined as number | undefined,
      userName: '',
      nickName: '',
      password: '',
      deptId: undefined as number | undefined,
      phonenumber: '',
      email: '',
      sex: '0',
      status: '0',
      postIds: [] as number[],
      roleIds: [] as number[],
      remark: '',
    };
  }

  loadDeptTree(): void {
    this.userApi.deptTree().subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        this.deptTreeData.set(data);
        this.deptNodes.set(this.toNzTree(data));
      },
    });
  }

  toNzTree(nodes: any[]): any[] {
    return (nodes || []).map((n) => ({
      title: n.label,
      key: n.id,
      id: n.id,
      isLeaf: !(n.children && n.children.length),
      children: n.children ? this.toNzTree(n.children) : undefined,
    }));
  }

  getList(): void {
    this.loading.set(true);
    const params = { ...this.query, deptId: this.selectedDeptId };
    this.userApi.list(params).subscribe({
      next: (res) => {
        const page = parsePage(res);
        this.userList.set(page.list);
        this.total.set(page.total);
        this.loading.set(false);
        this.checkedIds.clear();
        this.refreshChecked();
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void {
    this.query.pageNum = 1;
    this.getList();
  }

  onReset(): void {
    this.query = { pageNum: 1, pageSize: 10, userName: '', phonenumber: '', status: undefined, deptId: undefined };
    this.selectedDeptId = undefined;
    this.getList();
  }

  onDeptClick(event: any): void {
    this.selectedDeptId = event?.keys?.[0] ?? event?.node?.key;
    this.onQuery();
  }

  onPageIndexChange(page: number): void {
    this.query.pageNum = page;
    this.getList();
  }

  onPageSizeChange(size: number): void {
    this.query.pageSize = size;
    this.query.pageNum = 1;
    this.getList();
  }

  onItemChecked(id: number, checked: boolean): void {
    if (checked) this.checkedIds.add(id);
    else this.checkedIds.delete(id);
    this.refreshChecked();
  }

  onAllChecked(checked: boolean): void {
    this.userList().forEach((u) => {
      if (u.userId !== 1) {
        if (checked) this.checkedIds.add(u.userId);
        else this.checkedIds.delete(u.userId);
      }
    });
    this.refreshChecked();
  }

  refreshChecked(): void {
    const enabled = this.userList().filter((u) => u.userId !== 1);
    this.allChecked = enabled.length > 0 && enabled.every((u) => this.checkedIds.has(u.userId));
    this.indeterminate = enabled.some((u) => this.checkedIds.has(u.userId)) && !this.allChecked;
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '新增用户';
    this.userApi.getPostsAndRoles().subscribe({
      next: (res) => {
        this.postOptions = res?.data?.posts ?? [];
        this.roleOptions = res?.data?.roles ?? [];
        this.modalVisible = true;
      },
    });
  }

  openEdit(row?: any): void {
    const userId = row?.userId ?? [...this.checkedIds][0];
    if (!userId) return;
    this.modalTitle = '修改用户';
    this.userApi.get(userId).subscribe({
      next: (res) => {
        const wrap = res?.data ?? {};
        const u = wrap.data ?? {};
        this.postOptions = wrap.posts ?? [];
        this.roleOptions = wrap.roles ?? [];
        this.form = {
          userId: u.userId,
          userName: u.userName,
          nickName: u.nickName,
          password: '',
          deptId: u.deptId,
          phonenumber: u.phonenumber,
          email: u.email,
          sex: u.sex ?? '0',
          status: u.status ?? '0',
          postIds: (wrap.postIds ?? []).map(Number),
          roleIds: (wrap.roleIds ?? []).map(Number),
          remark: u.remark ?? '',
        };
        this.modalVisible = true;
      },
    });
  }

  submit(): void {
    if (!this.form.nickName) {
      this.message.warning('用户昵称不能为空');
      return;
    }
    if (!this.form.userId) {
      if (!this.form.userName) {
        this.message.warning('用户账号不能为空');
        return;
      }
      if (!this.form.password || this.form.password.length < 5) {
        this.message.warning('用户密码长度必须介于 5 和 20 之间');
        return;
      }
    }
    this.submitting = true;
    const payload = { ...this.form };
    const req$ = this.form.userId ? this.userApi.update(payload) : this.userApi.add(payload);
    req$.subscribe({
      next: () => {
        this.message.success('操作成功');
        this.modalVisible = false;
        this.submitting = false;
        this.getList();
      },
      error: () => (this.submitting = false),
    });
  }

  remove(row?: any): void {
    const ids = row?.userId ?? [...this.checkedIds].join(',');
    if (!ids) return;
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除用户编号为 "${ids}" 的数据项？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.userApi.remove(ids).subscribe({
            next: () => {
              this.message.success('删除成功');
              this.getList();
              resolve();
            },
            error: () => reject(),
          });
        }),
    });
  }

  onStatusChange(row: any, checked: boolean): void {
    const status = checked ? '0' : '1';
    const text = status === '0' ? '启用' : '停用';
    this.modal.confirm({
      nzTitle: '确认',
      nzContent: `确认要"${text}""${row.userName}"用户吗?`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.userApi.changeStatus(row.userId, status).subscribe({
            next: () => {
              row.status = status;
              this.message.success(text + '成功');
              resolve();
            },
            error: () => {
              reject();
            },
          });
        }),
      nzOnCancel: () => {
        // revert visual — switch is bound via [ngModel]
      },
    });
  }

  resetPwd(row: any): void {
    let pwd = '';
    this.modal.confirm({
      nzTitle: `请输入"${row.userName}"的新密码`,
      nzContent: `<input id="reset-pwd-input" class="ant-input" placeholder="5-20位密码" />`,
      nzOnOk: () => {
        const el = document.getElementById('reset-pwd-input') as HTMLInputElement;
        pwd = el?.value || '';
        if (!pwd || pwd.length < 5 || pwd.length > 20) {
          this.message.error('用户密码长度必须介于 5 和 20 之间');
          return false;
        }
        return new Promise<void>((resolve, reject) => {
          this.userApi.resetPwd(row.userId, pwd).subscribe({
            next: () => {
              this.message.success('修改成功，新密码是：' + pwd);
              resolve();
            },
            error: () => reject(),
          });
        });
      },
    });
  }

  export(): void {
    this.download.download('system/user/export', { ...this.query, deptId: this.selectedDeptId }, `user_${Date.now()}.xlsx`);
  }

  goAuthRole(row: any): void {
    this.router.navigate(['/system/user-auth/role', row.userId]);
  }

  statusLabel(val: string): string {
    return this.dictService.label(this.statusOptions, val);
  }
}

