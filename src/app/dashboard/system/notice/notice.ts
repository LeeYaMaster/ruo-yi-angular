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
import { NoticeApiService } from '../../../api/system/notice.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-notice',
  imports: [
    CommonModule, FormsModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule,
    NzModalModule, NzIconModule, HasPermiDirective, BuilderTable, BuilderForm,
  ],
  templateUrl: './notice.html',
  styleUrl: './notice.less',
})
export class Notice implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;

  private api = inject(NoticeApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  typeOptions: DictOption[] = [];
  statusOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, noticeTitle: '', createBy: '', noticeType: undefined as string | undefined };
  checkedIds = new Set<number>();
  modalVisible = false;
  modalTitle = '新增公告';
  submitting = false;
  editingId?: number;
  formConfig: FormConfig = [];

  columns: BuilderTableColumn[] = [
    { key: 'noticeId', title: '序号', width: '80px' },
    { key: 'noticeTitle', title: '公告标题' },
    { key: 'noticeType', title: '公告类型', format: (_r, v) => this.typeLabel(v) },
    { key: 'status', title: '状态', format: (_r, v) => this.statusLabel(v) },
    { key: 'createBy', title: '创建者' },
    { key: 'createTime', title: '创建时间', format: (_r, v) => parseTime(v) || '' },
  ];

  ngOnInit() {
    this.dict.getDict('sys_notice_type').subscribe((d) => (this.typeOptions = d));
    this.dict.getDict('sys_notice_status').subscribe((d) => (this.statusOptions = d));
    this.getList();
  }

  typeLabel(v: string) {
    return this.dict.label(this.typeOptions, v);
  }
  statusLabel(v: string) {
    return this.dict.label(this.statusOptions, v);
  }

  getList() {
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

  onQuery() {
    this.query.pageNum = 1;
    this.getList();
  }
  onReset() {
    this.query = { pageNum: 1, pageSize: 10, noticeTitle: '', createBy: '', noticeType: undefined };
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
        name: 'noticeTitle',
        component: 'input',
        label: '公告标题',
        placeholder: '请输入公告标题',
        rules: { required: true },
        errorMessage: { required: '公告标题不能为空' },
        defaultValue: data.noticeTitle ?? '',
      },
      {
        name: 'noticeType',
        component: 'select',
        label: '公告类型',
        placeholder: '请选择',
        rules: { required: true },
        errorMessage: { required: '公告类型不能为空' },
        defaultValue: data.noticeType ?? '1',
        options: this.typeOptions.map((d) => ({ label: d.label, value: d.value })),
      },
      {
        name: 'status',
        component: 'radio',
        label: '状态',
        defaultValue: data.status ?? '0',
        options: this.statusOptions.map((d) => ({ label: d.label, value: d.value })),
      },
      {
        name: 'noticeContent',
        component: 'textarea',
        label: '内容',
        placeholder: '支持 HTML 富文本，例如 <b>加粗</b>、<p>段落</p>',
        defaultValue: data.noticeContent ?? '',
        rows: 10,
      },
    ];
  }

  openAdd() {
    this.editingId = undefined;
    this.modalTitle = '新增公告';
    this.formConfig = this.buildFormConfig({});
    this.modalVisible = true;
  }

  openEdit(row?: any) {
    const id = row?.noticeId ?? [...this.checkedIds][0];
    if (!id) return;
    this.modalTitle = '修改公告';
    this.api.get(id).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.editingId = d.noticeId;
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
    const payload = { ...value, noticeId: this.editingId };
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
    const ids = row?.noticeId ?? [...this.checkedIds].join(',');
    if (!ids) return;
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除公告编号为"${ids}"的数据项？`,
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
}
