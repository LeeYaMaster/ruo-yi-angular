import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { RoleApiService } from '../../../api/system/role.api.service';
import { MenuApiService } from '../../../api/system/menu.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { Router } from '@angular/router';
import { DownloadService } from '../../../http/download.service';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';

@Component({
  selector: 'app-role',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzModalModule,
    NzSwitchModule,
    NzIconModule,
    NzRadioModule,
    NzInputNumberModule,
    NzTreeModule,
    NzCheckboxModule,
    HasPermiDirective,
    BuilderTable,
  ],
  templateUrl: './role.html',
  styleUrl: './role.less',
})
export class Role implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  private roleApi = inject(RoleApiService);
  private menuApi = inject(MenuApiService);
  private dictService = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private router = inject(Router);
  private download = inject(DownloadService);

  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  statusOptions: DictOption[] = [];

  query = { pageNum: 1, pageSize: 10, roleName: '', roleKey: '', status: undefined as string | undefined };
  checkedIds = new Set<number>();
  columns: BuilderTableColumn[] = [
    { key: 'roleId', title: '角色编号', width: '90px' },
    { key: 'roleName', title: '角色名称' },
    { key: 'roleKey', title: '权限字符' },
    { key: 'roleSort', title: '显示顺序', width: '90px' },
    { key: 'status', title: '状态', format: (_r, v) => this.dictService.label(this.statusOptions, v) },
    { key: 'createTime', title: '创建时间', format: (_r, v) => this.parseTime(v) || '' },
  ];

  modalVisible = false;
  modalTitle = '新增角色';
  submitting = false;
  form: any = this.emptyForm();

  menuNodes: any[] = [];
  checkedMenuKeys: (string | number)[] = [];
  menuExpandAll = true;
  menuCheckStrictly = true;

  dataScopeVisible = false;
  dataScopeSubmitting = false;
  dataScopeForm: any = { roleId: undefined, roleName: '', roleKey: '', dataScope: '1', deptIds: [] as number[], deptCheckStrictly: true };
  dataScopeOptions = [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' },
  ];
  deptNodes: any[] = [];
  checkedDeptKeys: (string | number)[] = [];
  deptExpandAll = true;
  deptCheckStrictly = true;

  parseTime = parseTime;

  ngOnInit(): void {
    this.dictService.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.getList();
  }

  emptyForm() {
    return {
      roleId: undefined as number | undefined,
      roleName: '',
      roleKey: '',
      roleSort: 0,
      status: '0',
      menuIds: [] as number[],
      remark: '',
      menuCheckStrictly: true,
    };
  }

  getList(): void {
    this.loading.set(true);
    this.roleApi.list(this.query).subscribe({
      next: (res) => {
        const page = parsePage(res);
        this.list.set(page.list);
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
    this.query = { pageNum: 1, pageSize: 10, roleName: '', roleKey: '', status: undefined };
    this.getList();
  }

  onPageIndexChange(p: number): void {
    this.query.pageNum = p;
    this.getList();
  }

  onPageSizeChange(s: number): void {
    this.query.pageSize = s;
    this.query.pageNum = 1;
    this.getList();
  }

  onSelection(ids: Set<any>) { this.checkedIds = ids as Set<number>; }

  toMenuNodes(nodes: any[]): any[] {
    return (nodes || []).map((n) => ({
      title: n.label ?? n.menuName,
      key: n.id ?? n.menuId,
      children: n.children ? this.toMenuNodes(n.children) : undefined,
      isLeaf: !(n.children && n.children.length),
    }));
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.modalTitle = '新增角色';
    this.checkedMenuKeys = [];
    this.menuApi.treeselect().subscribe({
      next: (res) => {
        this.menuNodes = this.toMenuNodes(res?.data ?? []);
        this.modalVisible = true;
      },
    });
  }

  openEdit(row?: any): void {
    const roleId = row?.roleId ?? [...this.checkedIds][0];
    if (!roleId) return;
    this.modalTitle = '修改角色';
    this.roleApi.get(roleId).subscribe({
      next: (res) => {
        const r = res?.data ?? res;
        this.form = {
          roleId: r.roleId,
          roleName: r.roleName,
          roleKey: r.roleKey,
          roleSort: r.roleSort ?? 0,
          status: r.status ?? '0',
          menuIds: [],
          remark: r.remark ?? '',
          menuCheckStrictly: r.menuCheckStrictly !== false,
        };
        this.menuCheckStrictly = this.form.menuCheckStrictly;
        this.menuApi.roleMenuTreeselect(roleId).subscribe({
          next: (menuRes) => {
            const data = menuRes?.data ?? {};
            this.menuNodes = this.toMenuNodes(data.menus ?? data);
            this.checkedMenuKeys = (data.checkedKeys ?? []).map((k: any) => k);
            this.modalVisible = true;
          },
        });
      },
    });
  }

  collectChecked(keys: (string | number)[]): number[] {
    return (keys || []).map((k) => Number(k)).filter((n) => !Number.isNaN(n));
  }

  submit(): void {
    if (!this.form.roleName || !this.form.roleKey) {
      this.message.warning('角色名称和权限字符不能为空');
      return;
    }
    this.submitting = true;
    const payload = {
      ...this.form,
      menuIds: this.collectChecked(this.checkedMenuKeys),
      menuCheckStrictly: this.menuCheckStrictly,
    };
    const req$ = this.form.roleId ? this.roleApi.update(payload) : this.roleApi.add(payload);
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
    const ids = row?.roleId ?? [...this.checkedIds].join(',');
    if (!ids) return;
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除角色编号为 "${ids}" 的数据项？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.roleApi.remove(ids).subscribe({
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
      nzContent: `确认要"${text}""${row.roleName}"角色吗?`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.roleApi.changeStatus(row.roleId, status).subscribe({
            next: () => {
              row.status = status;
              this.message.success(text + '成功');
              resolve();
            },
            error: () => reject(),
          });
        }),
    });
  }

  toDeptNodes(nodes: any[]): any[] {
    return (nodes || []).map((n) => ({
      title: n.label ?? n.deptName,
      key: n.id ?? n.deptId,
      children: n.children ? this.toDeptNodes(n.children) : undefined,
      isLeaf: !(n.children && n.children.length),
    }));
  }

  openDataScope(row: any): void {
    this.dataScopeForm = {
      roleId: row.roleId,
      roleName: row.roleName,
      roleKey: row.roleKey,
      dataScope: String(row.dataScope ?? '1'),
      deptIds: [],
      deptCheckStrictly: row.deptCheckStrictly !== false,
    };
    this.deptCheckStrictly = this.dataScopeForm.deptCheckStrictly;
    this.checkedDeptKeys = [];
    this.roleApi.deptTree(row.roleId).subscribe({
      next: (res) => {
        const data = res?.data ?? {};
        this.deptNodes = this.toDeptNodes(data.depts ?? data);
        this.checkedDeptKeys = (data.checkedKeys ?? []).map((k: any) => k);
        this.dataScopeVisible = true;
      },
    });
  }

  onDataScopeChange(value: string): void {
    if (value !== '2') {
      this.checkedDeptKeys = [];
    }
  }

  submitDataScope(): void {
    this.dataScopeSubmitting = true;
    const payload = {
      ...this.dataScopeForm,
      deptIds: this.collectChecked(this.checkedDeptKeys),
      deptCheckStrictly: this.deptCheckStrictly,
    };
    this.roleApi.dataScope(payload).subscribe({
      next: () => {
        this.message.success('修改成功');
        this.dataScopeVisible = false;
        this.dataScopeSubmitting = false;
        this.getList();
      },
      error: () => (this.dataScopeSubmitting = false),
    });
  }

  goAuthUser(row: any): void {
    this.router.navigate(['/system/role-auth/user', row.roleId]);
  }

  export(): void {
    this.download.download('system/role/export', { ...this.query }, `role_${Date.now()}.xlsx`);
  }
}
