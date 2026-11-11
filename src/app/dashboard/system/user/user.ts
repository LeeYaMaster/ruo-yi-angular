import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UserApiService } from '../../../api/system/user.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { DownloadService } from '../../../http/download.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { Router } from '@angular/router';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

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
    NzUploadModule,
    NzCheckboxModule,
    BuilderTable,
    BuilderForm,
  ],
  templateUrl: './user.html',
  styleUrl: './user.less',
})
export class User implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;
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

  modalVisible = false;
  modalTitle = '新增用户';
  submitting = false;
  formConfig: FormConfig = [];
  editingId?: number;

  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'userId', title: '用户编号', width: '90px' },
    { key: 'userName', title: '用户账号' },
    { key: 'nickName', title: '用户昵称' },
    { key: 'deptName', title: '部门', format: (r) => r.dept?.deptName || r.deptName || '' },
    { key: 'phonenumber', title: '手机号码' },
    { key: 'status', title: '状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'createTime', title: '创建时间', format: (_r, v) => this.parseTime(v) || '' },
  ];
  importVisible = false;
  importSubmitting = false;
  updateSupport = false;
  importFile: File | null = null;
  importFileList: NzUploadFile[] = [];


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
        this.bt?.clearSelection();
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

  onSelection(ids: Set<any>) { this.checkedIds = ids as Set<number>; }

  private treeSelectNodes(nodes: any[]): any[] {
    return (nodes || []).map((n) => ({
      title: n.title ?? n.label,
      key: n.key ?? n.id,
      value: n.key ?? n.id,
      isLeaf: n.isLeaf,
      children: n.children ? this.treeSelectNodes(n.children) : undefined,
    }));
  }

  private buildFormConfig(data: any): FormConfig {
    return [
      { name: 'userName', component: 'input', label: '用户账号', rules: { required: true }, errorMessage: { required: '用户账号不能为空' }, defaultValue: data.userName ?? '', when: () => !this.editingId },
      { name: 'password', component: 'password', label: '用户密码', rules: { required: true, minlength: 5 }, errorMessage: { required: '用户密码不能为空' }, defaultValue: '', when: () => !this.editingId },
      { name: 'nickName', component: 'input', label: '用户昵称', rules: { required: true }, errorMessage: { required: '用户昵称不能为空' }, defaultValue: data.nickName ?? '' },
      { name: 'deptId', component: 'tree-select', label: '归属部门', placeholder: '请选择归属部门', defaultValue: data.deptId, treeData: this.treeSelectNodes(this.deptNodes()) },
      { name: 'phonenumber', component: 'input', label: '手机号码', defaultValue: data.phonenumber ?? '' },
      { name: 'email', component: 'input', label: '邮箱', defaultValue: data.email ?? '' },
      { name: 'sex', component: 'select', label: '用户性别', defaultValue: data.sex ?? '0', options: this.sexOptions.map(d => ({ label: d.label, value: d.value })) },
      { name: 'status', component: 'radio', label: '状态', defaultValue: data.status ?? '0', options: this.statusOptions.map(d => ({ label: d.label, value: d.value })) },
      { name: 'postIds', component: 'select', label: '岗位', mode: 'multiple', placeholder: '请选择', defaultValue: data.postIds ?? [], options: this.postOptions.map(p => ({ label: p.postName, value: p.postId })) },
      { name: 'roleIds', component: 'select', label: '角色', mode: 'multiple', placeholder: '请选择', defaultValue: data.roleIds ?? [], options: this.roleOptions.map(r => ({ label: r.roleName, value: r.roleId })) },
      { name: 'remark', component: 'textarea', label: '备注', defaultValue: data.remark ?? '', rows: 3 },
    ];
  }

  openAdd(): void {
    this.editingId = undefined;
    this.modalTitle = '新增用户';
    this.userApi.getPostsAndRoles().subscribe({
      next: (res) => {
        this.postOptions = res?.data?.posts ?? [];
        this.roleOptions = res?.data?.roles ?? [];
        this.formConfig = this.buildFormConfig(this.emptyForm());
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
        this.editingId = u.userId;
        this.formConfig = this.buildFormConfig({
          userId: u.userId,
          userName: u.userName,
          nickName: u.nickName,
          deptId: u.deptId,
          phonenumber: u.phonenumber,
          email: u.email,
          sex: u.sex ?? '0',
          status: u.status ?? '0',
          postIds: (wrap.postIds ?? []).map(Number),
          roleIds: (wrap.roleIds ?? []).map(Number),
          remark: u.remark ?? '',
        });
        this.modalVisible = true;
      },
    });
  }

  submit(): void {
    const bf = this.bf; if (!bf) return;
    if (bf.validateForm.invalid) { bf.submitForm(); return; }
    const form = { ...bf.getRawValue(), userId: this.editingId };
    if (!form.nickName) {
      this.message.warning('用户昵称不能为空');
      return;
    }
    if (!form.userId) {
      if (!form.userName) {
        this.message.warning('用户账号不能为空');
        return;
      }
      if (!form.password || form.password.length < 5) {
        this.message.warning('用户密码长度必须介于 5 和 20 之间');
        return;
      }
    }
    this.submitting = true;
    const payload = { ...form };
    const req$ = form.userId ? this.userApi.update(payload) : this.userApi.add(payload);
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


  openImport(): void {
    this.importVisible = true;
    this.updateSupport = false;
    this.importFile = null;
    this.importFileList = [];
  }

  beforeImportUpload = (file: NzUploadFile): boolean => {
    const raw = file as unknown as File;
    this.importFile = raw;
    this.importFileList = [file];
    return false;
  };

  downloadTemplate(): void {
    this.download.download('system/user/importTemplate', {}, `user_template_${Date.now()}.xlsx`);
  }

  submitImport(): void {
    if (!this.importFile) {
      this.message.error('请选择要导入的文件');
      return;
    }
    this.importSubmitting = true;
    this.userApi.importData(this.importFile, this.updateSupport).subscribe({
      next: (res) => {
        this.importSubmitting = false;
        if (res?.code === 200) {
          this.message.success(res.msg || '导入成功');
          this.importVisible = false;
          this.getList();
        } else {
          this.message.error(res?.msg || '导入失败');
        }
      },
      error: (err) => {
        this.importSubmitting = false;
        const msg = err?.error?.msg || err?.message || '导入失败';
        this.message.error(msg);
      },
    });
  }

  goAuthRole(row: any): void {
    this.router.navigate(['/system/user-auth/role', row.userId]);
  }

  statusLabel(val: string): string {
    return this.dictService.label(this.statusOptions, val);
  }
}

