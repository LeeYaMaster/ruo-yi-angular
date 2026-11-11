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
import { RoleApiService } from '../../../api/system/role.api.service';
import { MenuApiService } from '../../../api/system/menu.api.service';
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
    NzIconModule,
    HasPermiDirective,
    BuilderTable,
    BuilderForm,
  ],
  templateUrl: './role.html',
  styleUrl: './role.less',
})
export class Role implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;
  @ViewChild('dsf') dsf?: BuilderForm;
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
  editingId?: number;
  formConfig: FormConfig = [];

  dataScopeVisible = false;
  dataScopeSubmitting = false;
  dataScopeRoleId?: number;
  dataScopeFormConfig: FormConfig = [];
  dataScopeOptions = [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' },
  ];

  parseTime = parseTime;

  ngOnInit(): void {
    this.dictService.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.getList();
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

  private toTreeNodes(nodes: any[], titleKeys: string[], idKeys: string[]): any[] {
    return (nodes || []).map((n) => {
      const title = titleKeys.map((k) => n[k]).find((v) => v !== undefined && v !== null) ?? '';
      const key = idKeys.map((k) => n[k]).find((v) => v !== undefined && v !== null);
      return {
        title,
        key,
        children: n.children ? this.toTreeNodes(n.children, titleKeys, idKeys) : undefined,
        isLeaf: !(n.children && n.children.length),
      };
    });
  }

  toMenuNodes(nodes: any[]): any[] {
    return this.toTreeNodes(nodes, ['label', 'menuName'], ['id', 'menuId']);
  }

  toDeptNodes(nodes: any[]): any[] {
    return this.toTreeNodes(nodes, ['label', 'deptName'], ['id', 'deptId']);
  }

  private buildRoleFormConfig(data: {
    roleName?: string;
    roleKey?: string;
    roleSort?: number;
    status?: string;
    remark?: string;
    menuCheckStrictly?: boolean;
    menuNodes?: any[];
    menuIds?: (string | number)[];
  }): FormConfig {
    return [
      {
        name: 'roleName',
        component: 'input',
        label: '角色名称',
        placeholder: '请输入角色名称',
        rules: { required: true },
        errorMessage: { required: '角色名称不能为空' },
        defaultValue: data.roleName ?? '',
      },
      {
        name: 'roleKey',
        component: 'input',
        label: '权限字符',
        placeholder: '请输入权限字符',
        rules: { required: true },
        errorMessage: { required: '权限字符不能为空' },
        defaultValue: data.roleKey ?? '',
      },
      {
        name: 'roleSort',
        component: 'number',
        label: '角色顺序',
        rules: { required: true },
        errorMessage: { required: '角色顺序不能为空' },
        defaultValue: data.roleSort ?? 0,
        min: 0,
      },
      {
        name: 'status',
        component: 'radio',
        label: '状态',
        defaultValue: data.status ?? '0',
        options: this.statusOptions.map((d) => ({ label: d.label, value: d.value })),
      },
      {
        name: 'menuIds',
        component: 'tree-check',
        label: '菜单权限',
        treeData: data.menuNodes ?? [],
        defaultValue: data.menuIds ?? [],
        treeLinkage: data.menuCheckStrictly !== false,
        treeLinkageName: 'menuCheckStrictly',
        treeExpandAll: true,
      },
      {
        name: 'remark',
        component: 'textarea',
        label: '备注',
        placeholder: '请输入内容',
        defaultValue: data.remark ?? '',
        rows: 3,
      },
    ];
  }

  private buildDataScopeFormConfig(data: {
    roleName?: string;
    roleKey?: string;
    dataScope?: string;
    deptCheckStrictly?: boolean;
    deptNodes?: any[];
    deptIds?: (string | number)[];
  }): FormConfig {
    return [
      {
        name: 'roleName',
        component: 'input',
        label: '角色名称',
        defaultValue: data.roleName ?? '',
        disabled: true,
      },
      {
        name: 'roleKey',
        component: 'input',
        label: '权限字符',
        defaultValue: data.roleKey ?? '',
        disabled: true,
      },
      {
        name: 'dataScope',
        component: 'select',
        label: '权限范围',
        defaultValue: String(data.dataScope ?? '1'),
        options: this.dataScopeOptions,
      },
      {
        name: 'deptIds',
        component: 'tree-check',
        label: '数据权限',
        treeData: data.deptNodes ?? [],
        defaultValue: data.deptIds ?? [],
        treeLinkage: data.deptCheckStrictly !== false,
        treeLinkageName: 'deptCheckStrictly',
        treeExpandAll: true,
        when: (form) => String(form?.dataScope) === '2',
      },
    ];
  }

  openAdd(): void {
    this.editingId = undefined;
    this.modalTitle = '新增角色';
    this.menuApi.treeselect().subscribe({
      next: (res) => {
        this.formConfig = this.buildRoleFormConfig({
          menuNodes: this.toMenuNodes(res?.data ?? []),
          menuIds: [],
          menuCheckStrictly: true,
        });
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
        this.editingId = r.roleId;
        this.menuApi.roleMenuTreeselect(roleId).subscribe({
          next: (menuRes) => {
            const data = menuRes?.data ?? {};
            this.formConfig = this.buildRoleFormConfig({
              roleName: r.roleName,
              roleKey: r.roleKey,
              roleSort: r.roleSort ?? 0,
              status: r.status ?? '0',
              remark: r.remark ?? '',
              menuCheckStrictly: r.menuCheckStrictly !== false,
              menuNodes: this.toMenuNodes(data.menus ?? data),
              menuIds: (data.checkedKeys ?? []).map((k: any) => k),
            });
            this.modalVisible = true;
          },
        });
      },
    });
  }

  save(): void {
    const bf = this.bf;
    if (!bf) return;
    if (bf.validateForm.invalid) {
      bf.submitForm();
      return;
    }
    const value = bf.getSubmitValue();
    this.submitting = true;
    const payload = {
      ...value,
      roleId: this.editingId,
      menuIds: value.menuIds ?? [],
      menuCheckStrictly: value.menuCheckStrictly !== false,
    };
    const req$ = this.editingId ? this.roleApi.update(payload) : this.roleApi.add(payload);
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

  openDataScope(row: any): void {
    this.dataScopeRoleId = row.roleId;
    this.roleApi.deptTree(row.roleId).subscribe({
      next: (res) => {
        const data = res?.data ?? {};
        this.dataScopeFormConfig = this.buildDataScopeFormConfig({
          roleName: row.roleName,
          roleKey: row.roleKey,
          dataScope: String(row.dataScope ?? '1'),
          deptCheckStrictly: row.deptCheckStrictly !== false,
          deptNodes: this.toDeptNodes(data.depts ?? data),
          deptIds: (data.checkedKeys ?? []).map((k: any) => k),
        });
        this.dataScopeVisible = true;
      },
    });
  }

  submitDataScope(): void {
    const dsf = this.dsf;
    if (!dsf) return;
    if (dsf.validateForm.invalid) {
      dsf.submitForm();
      return;
    }
    const value = dsf.getSubmitValue();
    this.dataScopeSubmitting = true;
    const dataScope = String(value.dataScope ?? '1');
    const payload = {
      roleId: this.dataScopeRoleId,
      roleName: value.roleName,
      roleKey: value.roleKey,
      dataScope,
      deptIds: dataScope === '2' ? (value.deptIds ?? []) : [],
      deptCheckStrictly: value.deptCheckStrictly !== false,
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
