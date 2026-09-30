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
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { DeptApiService } from '../../../api/system/dept.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { handleTree, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';

@Component({
  selector: 'app-dept',
  imports: [CommonModule, FormsModule, NzTableModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule, NzModalModule, NzIconModule, NzRadioModule, NzInputNumberModule, NzTreeSelectModule, HasPermiDirective],
  templateUrl: './dept.html',
  styleUrl: './dept.less',
})
export class Dept implements OnInit {
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
  form: any = this.emptyForm();
  parentNodes: any[] = [];
  parseTime = parseTime;

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
      },
    });
  }

  openAdd(row?: any): void {
    this.form = this.emptyForm();
    if (row?.deptId != null) this.form.parentId = row.deptId;
    this.modalTitle = '新增部门';
    this.loadParents();
    this.modalVisible = true;
  }

  openEdit(row: any): void {
    this.modalTitle = '修改部门';
    this.api.get(row.deptId).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.form = { deptId: d.deptId, parentId: d.parentId ?? 0, deptName: d.deptName, orderNum: d.orderNum ?? 0, leader: d.leader ?? '', phone: d.phone ?? '', email: d.email ?? '', status: d.status ?? '0' };
        this.loadParents(d.deptId);
        this.modalVisible = true;
      },
    });
  }

  submit(): void {
    if (!this.form.deptName) { this.message.warning('部门名称不能为空'); return; }
    this.submitting = true;
    const req$ = this.form.deptId ? this.api.update(this.form) : this.api.add(this.form);
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
