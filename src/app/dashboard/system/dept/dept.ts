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
import { DeptApiService } from '../../../api/system/dept.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { handleTree, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-dept',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, NzRadioModule, NzInputNumberModule, HasPermiDirective, BuilderTable, BuilderForm],
  templateUrl: './dept.html',
  styleUrl: './dept.less',
})
export class Dept implements OnInit {
  @ViewChild('bf') bf?: BuilderForm;
  private api = inject(DeptApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  loading = signal(false);
  list = signal<any[]>([]);
  statusOptions: DictOption[] = [];
  query = { deptName: '', status: undefined as string | undefined };
  expandAll = true;
  modalVisible = false;
  modalTitle = '新增部门';
  submitting = false;
  formConfig: FormConfig = [];
  parentNodes: any[] = [];
  editing: any = {};
  parseTime = parseTime;
  columns: BuilderTableColumn[] = [
    { key: 'deptName', title: '部门名称' },
    { key: 'orderNum', title: '排序', width: '80px' },
    { key: 'status', title: '状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'createTime', title: '创建时间', format: (_r, v) => this.parseTime(v) || '' },
  ];

  ngOnInit(): void {
    this.dict.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.getList();
  }

  emptyForm() {
    return { deptId: undefined as number | undefined, parentId: 0, deptName: '', orderNum: 0, leader: '', phone: '', email: '', status: '0' };
  }

  getList(): void {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => {
        this.list.set(handleTree(res?.data ?? [], 'deptId'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onQuery(): void { this.getList(); }
  onReset(): void { this.query = { deptName: '', status: undefined }; this.getList(); }

  toTree(nodes: any[], excludeId?: number): any[] {
    return (nodes || []).filter((n) => n.deptId !== excludeId).map((n) => ({
      title: n.deptName, key: n.deptId, value: n.deptId,
      children: n.children ? this.toTree(n.children, excludeId) : undefined,
      isLeaf: !(n.children && n.children.length),
    }));
  }

  loadParents(excludeId?: number): void {
    this.api.list().subscribe({
      next: (res) => {
        const tree = handleTree(res?.data ?? [], 'deptId');
        this.parentNodes = [{ title: '主类目', key: 0, value: 0, children: this.toTree(tree, excludeId) }];
        this.formConfig = this.buildFormConfig(this.editing);
        this.modalVisible = true;
      },
    });
  }

  private buildFormConfig(data: any): FormConfig {
    return [
      { name: 'parentId', component: 'tree-select', label: '上级部门', defaultValue: data.parentId ?? 0, treeData: this.parentNodes },
      { name: 'deptName', component: 'input', label: '部门名称', rules: { required: true }, errorMessage: { required: '部门名称不能为空' }, defaultValue: data.deptName ?? '' },
      { name: 'orderNum', component: 'number', label: '显示排序', rules: { required: true }, defaultValue: data.orderNum ?? 0, min: 0 },
      { name: 'leader', component: 'input', label: '负责人', defaultValue: data.leader ?? '' },
      { name: 'phone', component: 'input', label: '联系电话', defaultValue: data.phone ?? '' },
      { name: 'email', component: 'input', label: '邮箱', defaultValue: data.email ?? '' },
      { name: 'status', component: 'radio', label: '部门状态', defaultValue: data.status ?? '0', options: this.statusOptions.map(d => ({ label: d.label, value: d.value })) },
    ];
  }

  openAdd(row?: any): void {
    this.editing = this.emptyForm();
    if (row?.deptId != null) this.editing.parentId = row.deptId;
    this.modalTitle = '新增部门';
    this.loadParents();
  }

  openEdit(row: any): void {
    this.modalTitle = '修改部门';
    this.api.get(row.deptId).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.editing = { deptId: d.deptId, parentId: d.parentId ?? 0, deptName: d.deptName, orderNum: d.orderNum ?? 0, leader: d.leader ?? '', phone: d.phone ?? '', email: d.email ?? '', status: d.status ?? '0' };
        this.loadParents(d.deptId);
      },
    });
  }

  submit(): void {
    const bf = this.bf; if (!bf) return;
    if (bf.validateForm.invalid) { bf.submitForm(); return; }
    const value = { ...this.editing, ...bf.getRawValue() };
    this.submitting = true;
    const req$ = value.deptId ? this.api.update(value) : this.api.add(value);
    req$.subscribe({
      next: () => { this.message.success('操作成功'); this.modalVisible = false; this.submitting = false; this.getList(); },
      error: () => (this.submitting = false),
    });
  }

  remove(row: any): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除名称为"${row.deptName}"的数据项？`,
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.api.remove(row.deptId).subscribe({ next: () => { this.message.success('删除成功'); this.getList(); resolve(); }, error: () => reject() });
      }),
    });
  }

  statusLabel(v: string) { return this.dict.label(this.statusOptions, v); }
}
