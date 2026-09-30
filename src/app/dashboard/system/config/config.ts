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
import { ConfigApiService } from '../../../api/system/config.api.service';
import { DictService, DictOption } from '../../../api/dict.service';
import { parsePage, parseTime } from '../../../util/ruoyi.util';
import { DownloadService } from '../../../http/download.service';
import { HasPermiDirective } from '../../../auth/has-permi.directive';
import { BuilderTable } from '../../../builder/builder-table/builder-table';
import { BuilderTableColumn } from '../../../builder/builder-table/builder-table.model';
import { BuilderForm } from '../../../builder/builder-form/builder-form';
import { FormConfig } from '../../../builder/builder-form/builder-form.model';

@Component({
  selector: 'app-config',
  imports: [
    CommonModule, FormsModule, NzButtonModule, NzInputModule, NzSelectModule, NzFormModule,
    NzModalModule, NzIconModule, HasPermiDirective, BuilderTable, BuilderForm,
  ],
  templateUrl: './config.html',
  styleUrl: './config.less',
})
export class Config implements OnInit {
  @ViewChild('bt') bt?: BuilderTable;
  @ViewChild('bf') bf?: BuilderForm;

  private api = inject(ConfigApiService);
  private dict = inject(DictService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private download = inject(DownloadService);

  loading = signal(false);
  list = signal<any[]>([]);
  total = signal(0);
  typeOptions: DictOption[] = [];
  query = { pageNum: 1, pageSize: 10, configName: '', configKey: '', configType: undefined as string | undefined };
  checkedIds = new Set<number>();
  modalVisible = false;
  modalTitle = '新增参数';
  submitting = false;
  editingId?: number;
  formConfig: FormConfig = [];

  columns: BuilderTableColumn[] = [
    { key: 'configId', title: '参数主键', width: '90px' },
    { key: 'configName', title: '参数名称' },
    { key: 'configKey', title: '参数键名' },
    { key: 'configValue', title: '参数键值' },
    { key: 'configType', title: '系统内置', format: (_r, v) => this.typeLabel(v) },
    { key: 'remark', title: '备注' },
    { key: 'createTime', title: '创建时间', format: (_r, v) => parseTime(v) || '' },
  ];

  ngOnInit() {
    this.dict.getDict('sys_yes_no').subscribe((d) => (this.typeOptions = d));
    this.getList();
  }

  typeLabel(v: string) {
    return this.dict.label(this.typeOptions, v);
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
    this.query = { pageNum: 1, pageSize: 10, configName: '', configKey: '', configType: undefined };
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
        name: 'configName',
        component: 'input',
        label: '参数名称',
        placeholder: '请输入参数名称',
        rules: { required: true },
        errorMessage: { required: '参数名称不能为空' },
        defaultValue: data.configName ?? '',
      },
      {
        name: 'configKey',
        component: 'input',
        label: '参数键名',
        placeholder: '请输入参数键名',
        rules: { required: true },
        errorMessage: { required: '参数键名不能为空' },
        defaultValue: data.configKey ?? '',
      },
      {
        name: 'configValue',
        component: 'input',
        label: '参数键值',
        placeholder: '请输入参数键值',
        rules: { required: true },
        errorMessage: { required: '参数键值不能为空' },
        defaultValue: data.configValue ?? '',
      },
      {
        name: 'configType',
        component: 'radio',
        label: '系统内置',
        defaultValue: data.configType ?? 'Y',
        options: this.typeOptions.map((d) => ({ label: d.label, value: d.value })),
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
    this.modalTitle = '新增参数';
    this.formConfig = this.buildFormConfig({});
    this.modalVisible = true;
  }

  openEdit(row?: any) {
    const id = row?.configId ?? [...this.checkedIds][0];
    if (!id) return;
    this.modalTitle = '修改参数';
    this.api.get(id).subscribe({
      next: (res) => {
        const d = res?.data ?? {};
        this.editingId = d.configId;
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
    const payload = { ...value, configId: this.editingId };
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
    const ids = row?.configId ?? [...this.checkedIds].join(',');
    if (!ids) return;
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `是否确认删除参数编号为"${ids}"的数据项？`,
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

  refreshCache() {
    this.api.refreshCache().subscribe({ next: () => this.message.success('刷新成功') });
  }

  export(): void {
    this.download.download('system/config/export', { ...this.query }, `config_${Date.now()}.xlsx`);
  }
}
