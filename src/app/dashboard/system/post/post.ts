import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PostApiService } from '../../../api/system/post.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { DownloadService } from '../../../http/download.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-post',
  imports: [
    CommonModule, FormsModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule,
    NzModalModule, NzIconModule, HasPermiDirective, BuilderTable, BuilderForm,
  ],
  templateUrl: './post.html',
  styleUrl: './post.less',
})
export class Post implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;

  private api = inject(PostApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);

  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, postCode: '', postName: '', status: undefined as string | undefined };
  checkedIds = new Set<number>();
  modalVisible = false;
  modalTitle = '新增岗位';
  submitting = false;
  editingId?: number;
  formConfig: FormConfig = [];

  columns: BuilderTableColumn[] = [
    { key: 'postId', title: '岗位编号', width: '90px' },
    { key: 'postCode', title: '岗位编码' },
    { key: 'postName', title: '岗位名称' },
    { key: 'postSort', title: '岗位排序', width: '90px' },
    { key: 'status', title: '状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'createTime', title: '创建时间', format: (_r, v) => parseTime(v) || '' },
  ];

  ngOnInit(): void {
    this.dict.getDict('sys_normal_disable').subscribe((d) => (this.statusOptions = d));
    this.getList();
  }

  statusLabel(v: string) {
    return this.dict.label(this.statusOptions, v);
  }

  getList(): void {
    this.loading.set(true);
    this.api.list(this.query).subscribe({
      next: (res) => {
        const p = parsePage(res);
        this.list.set(p.list);
        this.total.set(p.total);
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
    this.query = { pageNum: 1, pageSize: 10, postCode: '', postName: '', status: undefined };
    this.getList();
  }
  onPageIndexChange(p: number) {
    this.query.pageNum = p;
    this.getList();
  }
  onPageSizeChange(s: number) {
    this.query.pageSize = s;
    this.query.pageNum = 1;
    this.getList();
  }
  onSelection(ids: Set<any>) {
    this.checkedIds = ids as Set<number>;
  }

  private buildFormConfig(data: any): FormConfig {
    return [
      {
        name: 'postName',
        component: 'input',
        label: '岗位名称',
        placeholder: '请输入岗位名称',
        rules: { required: true },
        errorMessage: { required: '岗位名称不能为空' },
        defaultValue: data.postName ?? '',
      },
      {
        name: 'postCode',
        component: 'input',
        label: '岗位编码',
        placeholder: '请输入编码',
        rules: { required: true },
        errorMessage: { required: '岗位编码不能为空' },
        defaultValue: data.postCode ?? '',
      },
      {
        name: 'postSort',
        component: 'number',
        label: '岗位顺序',
        rules: { required: true },
        errorMessage: { required: '岗位顺序不能为空' },
        defaultValue: data.postSort ?? 0,
        min: 0,
      },
      {
        name: 'status',
        component: 'radio',
        label: '岗位状态',
        defaultValue: data.status ?? '0',
        options: this.statusOptions.map((d) => ({ label: d.label, value: d.value })),
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

  openAdd() {
    this.editingId = undefined;
    this.modalTitle = '新增岗位';
    this.formConfig = this.buildFormConfig({});
    this.modalVisible = true;
  }

  openEdit(row?: any) {
    const id = row?.postId ?? [...this.checkedIds][0];
    if (!id) return;
    this.modalTitle = '修改岗位';
    this.api.get(id).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.editingId = d.postId;
        this.formConfig = this.buildFormConfig(d);
        this.modalVisible = true;
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
    const value = bf.getRawValue();
    this.submitting = true;
    const payload = { ...value, postId: this.editingId };
    const req$ = this.editingId ? this.api.update(payload) : this.api.add(payload);
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

  remove(row?: any) {
    const ids = row?.postId ?? [...this.checkedIds].join(',');
    if (!ids) return;
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除岗位编号为"${ids}"的数据项？`,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.api.remove(ids).subscribe({
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

  export(): void {
    this.download.download('system/post/export', { ...this.query }, `post_${Date.now()}.xlsx`);
  }
}
