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
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { MenuApiService } from '../../../api/system/menu.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { handleTree, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-menu',
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
    NzRadioModule,
    NzInputNumberModule,
    HasPermiDirective, BuilderTable, BuilderForm,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.less',
})
export class Menu implements OnInit {
  @ViewChild('bf') bf?: BuilderForm;
  private menuApi = inject(MenuApiService);
  private dictService = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  loading = signal(false);
  menuList = signal<any[]>([]);
  statusOptions: DictOption[] = [];
  showHideOptions: DictOption[] = [];

  query = { menuName: '', status: undefined as string | undefined };
  expandAll = true;

  modalVisible = false;
  modalTitle = '新增菜单';
  submitting = false;
  formConfig: FormConfig = [];
  parentNodes: any[] = [];
  editing: any = {};

  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'menuName', title: '菜单名称' },
    { key: 'icon', title: '图标', width: '80px' },
    { key: 'orderNum', title: '排序', width: '70px' },
    { key: 'perms', title: '权限标识' },
    { key: 'component', title: '组件路径' },
    { key: 'status', title: '状态', width: '80px', format: (_r, v) => this.statusLabel(v) },
    { key: 'createTime', title: '创建时间', width: '160px', format: (_r, v) => this.parseTime(v) || '' },
  ];

  ngOnInit(): void {
    this.dictService.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.dictService.getDict('sys_show_hide').subscribe((d) => (this.showHideOptions = d));
    this.getList();
  }

  emptyForm() {
    return {
      menuId: undefined as number | undefined,
      parentId: 0,
      menuType: 'M',
      menuName: '',
      icon: '',
      orderNum: 0,
      isFrame: '1',
      isCache: '0',
      path: '',
      component: '',
      perms: '',
      query: '',
      visible: '0',
      status: '0',
    };
  }

  getList(): void {
    this.loading.set(true);
    this.menuApi.list(this.query).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        this.menuList.set(handleTree(data, 'menuId'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void {
    this.getList();
  }

  onReset(): void {
    this.query = { menuName: '', status: undefined };
    this.getList();
  }

  loadParentOptions(excludeId?: number): void {
    this.menuApi.list().subscribe({
      next: (res) => {
        const data = handleTree(res?.data ?? [], 'menuId');
        const root = { title: '主类目', key: 0, value: 0, children: this.toTreeSelect(data, excludeId) };
        this.parentNodes = [root];
        this.formConfig = this.buildFormConfig(this.editing);
        this.modalVisible = true;
      },
    });
  }

  toTreeSelect(nodes: any[], excludeId?: number): any[] {
    return (nodes || [])
      .filter((n) => n.menuId !== excludeId)
      .map((n) => ({
        title: n.menuName,
        key: n.menuId,
        value: n.menuId,
        children: n.children ? this.toTreeSelect(n.children, excludeId) : undefined,
        isLeaf: !(n.children && n.children.length),
      }));
  }

  private buildFormConfig(data: any): FormConfig {
    const types = [{ label: '目录', value: 'M' }, { label: '菜单', value: 'C' }, { label: '按钮', value: 'F' }];
    const yn = [{ label: '是', value: '0' }, { label: '否', value: '1' }];
    return [
      { name: 'parentId', component: 'tree-select', label: '上级菜单', defaultValue: data.parentId ?? 0, treeData: this.parentNodes },
      { name: 'menuType', component: 'radio', label: '菜单类型', defaultValue: data.menuType ?? 'M', options: types },
      { name: 'menuName', component: 'input', label: '菜单名称', rules: { required: true }, errorMessage: { required: '菜单名称不能为空' }, defaultValue: data.menuName ?? '' },
      { name: 'icon', component: 'input', label: '菜单图标', defaultValue: data.icon ?? '', when: (f) => f.menuType !== 'F' },
      { name: 'orderNum', component: 'number', label: '显示排序', rules: { required: true }, defaultValue: data.orderNum ?? 0, min: 0 },
      { name: 'isFrame', component: 'radio', label: '是否外链', defaultValue: data.isFrame ?? '1', options: yn, when: (f) => f.menuType !== 'F' },
      { name: 'path', component: 'input', label: '路由地址', defaultValue: data.path ?? '', when: (f) => f.menuType !== 'F' },
      { name: 'component', component: 'input', label: '组件路径', defaultValue: data.component ?? '', when: (f) => f.menuType === 'C' },
      { name: 'query', component: 'input', label: '路由参数', defaultValue: data.query ?? '', when: (f) => f.menuType === 'C' },
      { name: 'isCache', component: 'radio', label: '是否缓存', defaultValue: data.isCache ?? '0', options: [{ label: '缓存', value: '0' }, { label: '不缓存', value: '1' }], when: (f) => f.menuType === 'C' },
      { name: 'visible', component: 'radio', label: '显示状态', defaultValue: data.visible ?? '0', options: this.showHideOptions.map(d => ({ label: d.label, value: d.value })), when: (f) => f.menuType !== 'F' },
      { name: 'perms', component: 'input', label: '权限标识', defaultValue: data.perms ?? '', when: (f) => f.menuType !== 'M' },
      { name: 'status', component: 'radio', label: '菜单状态', defaultValue: data.status ?? '0', options: this.statusOptions.map(d => ({ label: d.label, value: d.value })) },
    ];
  }

  openAdd(row?: any): void {
    this.editing = this.emptyForm();
    if (row?.menuId != null) this.editing.parentId = row.menuId;
    this.modalTitle = '新增菜单';
    this.loadParentOptions();
  }

  openEdit(row: any): void {
    this.modalTitle = '修改菜单';
    this.menuApi.get(row.menuId).subscribe({
      next: (res) => {
        const m = res?.data ?? {};
        this.editing = {
          menuId: m.menuId,
          parentId: m.parentId ?? 0,
          menuType: m.menuType ?? 'M',
          menuName: m.menuName,
          icon: m.icon ?? '',
          orderNum: m.orderNum ?? 0,
          isFrame: m.isFrame ?? '1',
          isCache: m.isCache ?? '0',
          path: m.path ?? '',
          component: m.component ?? '',
          perms: m.perms ?? '',
          query: m.query ?? '',
          visible: m.visible ?? '0',
          status: m.status ?? '0',
        };
        this.loadParentOptions(m.menuId);
      },
    });
  }

  submit(): void {
    const bf = this.bf; if (!bf) return;
    if (bf.validateForm.invalid) { bf.submitForm(); return; }
    const value = { ...this.editing, ...bf.getRawValue() };
    this.submitting = true;
    const req$ = value.menuId ? this.menuApi.update(value) : this.menuApi.add(value);
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

  remove(row: any): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除名称为"${row.menuName}"的数据项？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.menuApi.remove(row.menuId).subscribe({
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

  statusLabel(val: string): string {
    return this.dictService.label(this.statusOptions, val);
  }
}
